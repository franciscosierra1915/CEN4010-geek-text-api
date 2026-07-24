/**
 * @file cart.controller.js
 * @description Controller functions for all Shopping Cart API endpoints.
 *
 * A controller function receives the Express (req, res) pair from the router,
 * executes any required business logic or database queries, and sends the HTTP
 * response back to the client.
 *
 * All database access goes through Prisma Client, which translates JavaScript
 * method calls into type-safe SQL queries against the PostgreSQL database.
 *
 * Every function in this file is async because Prisma operations return Promises.
 * Errors are caught with try/catch and always return a structured JSON error
 * response rather than crashing the server.
 *
 * @module controllers/cart
 */

const { PrismaClient } = require('@prisma/client'); // Import the auto-generated Prisma client class

/**
 * Single shared Prisma client instance for this module.
 * Creating multiple PrismaClient instances in one process is wasteful
 * (each opens its own connection pool), so we instantiate once and reuse.
 * @type {import('@prisma/client').PrismaClient}
 */
const prisma = new PrismaClient();

// ─────────────────────────────────────────────────────────────────────────────
//  getCartByUser
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function getCartByUser
 * @summary  Fetch all cart items belonging to a specific user, joined with book details.
 * @async
 *
 * Uses Prisma's nested `include` to pull each CartItem along with its parent
 * Book, the book's Author (for the display name), and the book's Publisher
 * (for the discount percentage). Prisma translates the include tree into a
 * single SQL query with LEFT JOINs — the client receives a fully hydrated
 * object tree without making extra requests.
 *
 * The response is shaped for direct rendering in a cart view: each item
 * carries the title, author name, cover image, unit price, applied discount,
 * quantity, and a precomputed line total. A top-level `subtotal` sums every
 * discounted line so the frontend (or future checkout endpoint) never has to
 * recalculate money client-side.
 *
 * @param {import('express').Request}  req               - Express request object.
 * @param {string}                     req.params.userId - The user ID extracted from the URL path.
 * @param {import('express').Response} res               - Express response object used to send the reply.
 *
 * @returns {void} Sends one of:
 *   - HTTP 200 with `{ userId, itemCount, totalQuantity, subtotal, items: [...] }` on success.
 *     When the cart is empty, `items` is `[]` and totals are `0`.
 *   - HTTP 400 with `{ error: string }` if the userId path param is not a valid integer.
 *   - HTTP 404 with `{ error: string }` if no user exists with the given id.
 *   - HTTP 500 with `{ error: string }` if the database query fails.
 *
 * @example
 * // GET /api/cart/1 → 200
 * {
 *   "userId": 1,
 *   "itemCount": 2,
 *   "totalQuantity": 3,
 *   "subtotal": 142.47,
 *   "items": [
 *     {
 *       "cartItemId": 7,
 *       "bookId": 1,
 *       "title": "Clean Code",
 *       "author": "Robert Martin",
 *       "coverImage": "https://.../clean-code.jpg",
 *       "quantity": 2,
 *       "unitPrice": 49.99,
 *       "discountPercent": 5,
 *       "discountedUnitPrice": 47.49,
 *       "lineTotal": 94.98
 *     },
 *     ...
 *   ]
 * }
 */
const getCartByUser = async (req, res) => {
  // ── 1. Parse and validate the userId path param ─────────────────────────
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'A valid userId is required in the URL path.' });
  }

  try {
    // ── 2. Confirm the user exists ────────────────────────────────────────
    // Distinguishes "user has no cart items" (200 with empty array) from
    // "user does not exist" (404).
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: `User with id ${userId} not found.` });
    }

    // ── 3. Fetch all cart items with their book + author + publisher ──────
    // The nested `include` becomes a single SELECT with LEFT JOINs. Sorting
    // by cartItem id keeps display order stable across repeat fetches.
    const cartItems = await prisma.cartItem.findMany({
      where:   { userId },
      orderBy: { id: 'asc' },
      include: {
        book: {
          include: {
            author:    true, // Needed for the displayed author name
            publisher: true, // Needed to apply the publisher's discount
          },
        },
      },
    });

    // ── 4. Shape the payload for the frontend ─────────────────────────────
    // Money is rounded to two decimals at the boundary so JSON consumers
    // never have to deal with floating-point artifacts (e.g. 47.490000001).
    const round2 = (n) => Math.round(n * 100) / 100;

    const items = cartItems.map((ci) => {
      const unitPrice           = ci.book.price;
      const discountPercent     = ci.book.publisher.discountPercent;
      const discountedUnitPrice = round2(unitPrice * (1 - discountPercent / 100));
      const lineTotal           = round2(discountedUnitPrice * ci.quantity);

      return {
        cartItemId:          ci.id,
        bookId:              ci.book.id,
        title:               ci.book.title,
        author:              `${ci.book.author.firstName} ${ci.book.author.lastName}`,
        coverImage:          ci.book.coverImage, // May be null when no cover is uploaded
        quantity:            ci.quantity,
        unitPrice:           round2(unitPrice),
        discountPercent,
        discountedUnitPrice,
        lineTotal,
      };
    });

    // ── 5. Aggregate top-level totals ─────────────────────────────────────
    // itemCount    = number of distinct books in the cart (rows).
    // totalQuantity = total copies the user is buying (sum of quantities).
    // subtotal     = sum of every line total, after publisher discounts.
    const totalQuantity = items.reduce((sum, i) => sum + i.quantity,  0);
    const subtotal      = round2(items.reduce((sum, i) => sum + i.lineTotal, 0));

    return res.status(200).json({
      userId,
      itemCount: items.length,
      totalQuantity,
      subtotal,
      items,
    });
  } catch (error) {
    console.error('getCartByUser error:', error);
    return res.status(500).json({ error: 'Failed to retrieve cart.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  addBookToCart
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function addBookToCart
 * @summary  Add a book to a user's shopping cart, or increment its quantity if already present.
 * @async
 *
 * Uses Prisma's `upsert` against the compound unique key `(userId, bookId)`
 * declared in schema.prisma. This makes the operation atomic:
 *   - If no CartItem exists for this (user, book) pair, a new row is created
 *     with the requested quantity.
 *   - If a CartItem already exists, its quantity is incremented by the
 *     requested amount instead of inserting a duplicate row.
 *
 * Inventory / stock validation is intentionally out of scope: the current
 * Book model does not track available stock, so no upper bound is enforced
 * beyond a basic positive-integer sanity check.
 *
 * @param {import('express').Request}  req                  - Express request object.
 * @param {string}                     req.params.userId    - The user ID extracted from the URL path.
 * @param {object}                     req.body             - JSON body of the request.
 * @param {number}                     req.body.bookId      - ID of the book being added.
 * @param {number}                    [req.body.quantity=1] - Number of copies to add. Defaults to 1 when omitted.
 * @param {import('express').Response} res                  - Express response object used to send the reply.
 *
 * @returns {void} Sends one of:
 *   - HTTP 201 with `{ message: string, data: CartItem }` on success.
 *   - HTTP 400 with `{ error: string }` if userId/bookId/quantity are missing or invalid.
 *   - HTTP 404 with `{ error: string }` if the user or book does not exist.
 *   - HTTP 500 with `{ error: string }` if the database operation fails.
 *
 * @example
 * // POST /api/cart/1/items
 * // body: { "bookId": 3, "quantity": 2 }
 * // 201 response:
 * {
 *   "message": "Book added to cart.",
 *   "data": { "id": 7, "userId": 1, "bookId": 3, "quantity": 2 }
 * }
 */
const addBookToCart = async (req, res) => {
  // ── 1. Parse and validate inputs ──────────────────────────────────────────
  // URL params arrive as strings; coerce to integers so Prisma receives the
  // correct types and so we can reject malformed values up front.
  const userId   = Number.parseInt(req.params.userId, 10);
  const bookId   = Number.parseInt(req.body.bookId,   10);
  // Quantity defaults to 1 when the client omits it — matches the schema default.
  const quantity = req.body.quantity === undefined
    ? 1
    : Number.parseInt(req.body.quantity, 10);

  if (Number.isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'A valid userId is required in the URL path.' });
  }
  if (Number.isNaN(bookId) || bookId <= 0) {
    return res.status(400).json({ error: 'A valid bookId is required in the request body.' });
  }
  if (Number.isNaN(quantity) || quantity <= 0) {
    return res.status(400).json({ error: 'quantity must be a positive integer.' });
  }

  try {
    // ── 2. Confirm the referenced user and book actually exist ──────────────
    // Without this check, a bad ID would surface as a generic foreign-key
    // violation (HTTP 500). A 404 is a clearer signal to the client.
    const [user, book] = await Promise.all([
      prisma.user.findUnique({ where: { id: userId } }),
      prisma.book.findUnique({ where: { id: bookId } }),
    ]);

    if (!user) {
      return res.status(404).json({ error: `User with id ${userId} not found.` });
    }
    if (!book) {
      return res.status(404).json({ error: `Book with id ${bookId} not found.` });
    }

    // ── 3. Upsert the cart item ─────────────────────────────────────────────
    // The compound key `userId_bookId` is auto-generated by Prisma because
    // schema.prisma declares `@@unique([userId, bookId])` on CartItem.
    // `increment` is an atomic SQL UPDATE — safe under concurrent requests.
    const cartItem = await prisma.cartItem.upsert({
      where:  { userId_bookId: { userId, bookId } },
      create: { userId, bookId, quantity },
      update: { quantity: { increment: quantity } },
    });

    return res.status(201).json({
      message: 'Book added to cart.',
      data:    cartItem,
    });
  } catch (error) {
    console.error('addBookToCart error:', error);
    return res.status(500).json({ error: 'Failed to add book to cart.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  getCartSubtotal
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function getCartSubtotal
 * @summary  Return only the calculated subtotal price for a user's cart.
 * @async
 *
 * Implements Feature 3 · Action 1 from the project spec: "Retrieve the
 * subtotal price of all items in the user's shopping cart." The spec
 * requires this to be its own separate API route (see project brief:
 * "Each API Action is its own separate API route"), so this function
 * intentionally returns only the calculated number rather than the full
 * cart listing produced by getCartByUser.
 *
 * The subtotal reflects each item's quantity multiplied by the book's
 * price after the publisher's discount is applied, matching the pricing
 * logic used by the retrieve-cart endpoint so the two never disagree.
 *
 * @param {import('express').Request}  req               - Express request object.
 * @param {string}                     req.params.userId - The user ID extracted from the URL path.
 * @param {import('express').Response} res               - Express response object used to send the reply.
 *
 * @returns {void} Sends one of:
 *   - HTTP 200 with `{ userId, subtotal }` on success. `subtotal` is 0 when the cart is empty.
 *   - HTTP 400 with `{ error: string }` if the userId path param is not a valid integer.
 *   - HTTP 404 with `{ error: string }` if no user exists with the given id.
 *   - HTTP 500 with `{ error: string }` if the database query fails.
 *
 * @example
 * // GET /api/cart/1/subtotal → 200
 * { "userId": 1, "subtotal": 142.47 }
 */
const getCartSubtotal = async (req, res) => {
  // ── 1. Parse and validate the userId path param ─────────────────────────
  const userId = Number.parseInt(req.params.userId, 10);
  if (Number.isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'A valid userId is required in the URL path.' });
  }

  try {
    // ── 2. Confirm the user exists ────────────────────────────────────────
    // Same distinction as getCartByUser: "empty cart" (200 with 0) differs
    // from "user does not exist" (404).
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      return res.status(404).json({ error: `User with id ${userId} not found.` });
    }

    // ── 3. Pull only what's needed to compute money ───────────────────────
    // We deliberately do NOT include author or coverImage here — this
    // endpoint's contract is "return the subtotal," so we skip the joins
    // that the list endpoint needs. Publisher is still required for the
    // discount percentage.
    const cartItems = await prisma.cartItem.findMany({
      where: { userId },
      include: {
        book: {
          include: { publisher: true },
        },
      },
    });

    // ── 4. Sum every line total after applying the publisher discount ────
    const round2   = (n) => Math.round(n * 100) / 100;
    const subtotal = round2(
      cartItems.reduce((sum, ci) => {
        const discounted = ci.book.price * (1 - ci.book.publisher.discountPercent / 100);
        return sum + discounted * ci.quantity;
      }, 0),
    );

    return res.status(200).json({ userId, subtotal });
  } catch (error) {
    console.error('getCartSubtotal error:', error);
    return res.status(500).json({ error: 'Failed to calculate cart subtotal.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  removeBookFromCart
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function removeBookFromCart
 * @summary  Delete a single book from a user's shopping cart.
 * @async
 *
 * Implements Feature 3 · Action 4 from the project spec: "Delete a book
 * from the shopping cart instance for that user." The spec passes book id
 * and user id; both are taken from the URL path here so the operation is
 * fully addressable (RESTful) and idempotent.
 *
 * A quantity is NOT decremented — the spec calls for removing the book
 * from the cart entirely, so the whole CartItem row is deleted regardless
 * of how many copies were in it.
 *
 * @param {import('express').Request}  req               - Express request object.
 * @param {string}                     req.params.userId - The user ID from the URL path.
 * @param {string}                     req.params.bookId - The book ID from the URL path.
 * @param {import('express').Response} res               - Express response object used to send the reply.
 *
 * @returns {void} Sends one of:
 *   - HTTP 204 with no body on successful deletion (matches spec: "Response Data: None").
 *   - HTTP 400 with `{ error: string }` if userId/bookId are not valid integers.
 *   - HTTP 404 with `{ error: string }` if no cart item exists for that (user, book) pair.
 *   - HTTP 500 with `{ error: string }` if the database operation fails.
 *
 * @example
 * // DELETE /api/cart/1/items/3 → 204 No Content (empty body)
 */
const removeBookFromCart = async (req, res) => {
  // ── 1. Parse and validate both path params ──────────────────────────────
  const userId = Number.parseInt(req.params.userId, 10);
  const bookId = Number.parseInt(req.params.bookId, 10);

  if (Number.isNaN(userId) || userId <= 0) {
    return res.status(400).json({ error: 'A valid userId is required in the URL path.' });
  }
  if (Number.isNaN(bookId) || bookId <= 0) {
    return res.status(400).json({ error: 'A valid bookId is required in the URL path.' });
  }

  try {
    // ── 2. Delete by the compound unique key ──────────────────────────────
    // Using `delete` (not `deleteMany`) lets us distinguish "no such item"
    // from a successful delete — Prisma throws P2025 when the row is not
    // found, which we translate into a 404 for the client.
    await prisma.cartItem.delete({
      where: { userId_bookId: { userId, bookId } },
    });

    // 204 No Content is the correct success code when the response has no
    // body. Matches the spec's "Response Data: None" requirement literally.
    return res.status(204).send();
  } catch (error) {
    // P2025 = "An operation failed because it depends on one or more
    // records that were required but not found." Prisma's canonical
    // not-found code — mapped to a friendlier 404 here.
    if (error.code === 'P2025') {
      return res.status(404).json({
        error: `No cart item found for user ${userId} and book ${bookId}.`,
      });
    }

    console.error('removeBookFromCart error:', error);
    return res.status(500).json({ error: 'Failed to remove book from cart.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export the controller functions so cart.routes.js can attach them
 * to the correct HTTP method + path combinations.
 */
module.exports = {
  getCartByUser,
  addBookToCart,
  getCartSubtotal,
  removeBookFromCart,
};
