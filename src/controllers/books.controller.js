/**
 * @file books.controller.js
 * @description Controller functions for all Book-related API endpoints.
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
 * @module controllers/books
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
//  getAllBooks
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function getAllBooks
 * @summary  Fetch every book in the catalog and return them as a JSON list.
 * @async
 *
 * Uses Prisma's `findMany` to retrieve all Book rows.
 * The `include` option performs SQL JOINs so the author, publisher, and genre
 * objects are nested inside each book — the client never needs a separate request.
 * Books are returned in ascending alphabetical order by title.
 *
 * @param {import('express').Request}  req - Express request object. No query params or body used.
 * @param {import('express').Response} res - Express response object used to send the reply.
 *
 * @returns {void} Sends one of:
 *   - HTTP 200 with `{ count: number, data: Book[] }` on success.
 *   - HTTP 500 with `{ error: string }` if the database query fails.
 *
 * @example
 * // Successful response body
 * {
 *   "count": 30,
 *   "data": [
 *     {
 *       "id": 1,
 *       "isbn": "9780132350884",
 *       "title": "Clean Code",
 *       "price": 49.99,
 *       "author":    { "firstName": "Robert", "lastName": "Martin", ... },
 *       "publisher": { "name": "Addison-Wesley", "discountPercent": 5 },
 *       "genre":     { "name": "Software Engineering" }
 *     },
 *     ...
 *   ]
 * }
 */
const getAllBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        author:    true, // Joins the Author table — returns the full author object
        publisher: true, // Joins the Publisher table — includes discount info
        genre:     true, // Joins the Genre table — returns the genre name
      },
      orderBy: { title: 'asc' }, // Sort alphabetically by title so the list is predictable
    });

    // Return the total count alongside the array so clients can paginate or display "X results"
    // without having to count the array themselves.
    res.status(200).json({
      count: books.length, // Total number of books returned
      data:  books,        // Array of book objects with nested relations
    });
  } catch (error) {
    // Log the full error server-side for debugging, but send only a generic
    // message to the client to avoid exposing internal database details.
    console.error('getAllBooks error:', error);
    res.status(500).json({ error: 'Failed to retrieve books.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  getBookByIsbn
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function getBookByIsbn
 * @summary  Fetch a single book by its ISBN with full details — including ratings and comments.
 * @async
 *
 * Uses Prisma's `findUnique` (SQL: SELECT … WHERE isbn = $1) to look up exactly
 * one book. If no book matches, the handler returns 404 before touching the
 * response body.
 *
 * In addition to the author/publisher/genre joins from getAllBooks, this endpoint
 * also loads:
 *   - `ratings`  — every star rating the book has received.
 *   - `comments` — every written comment, with the commenter's username but
 *                  NOT their password or email (enforced via Prisma's `select`).
 *
 * A computed `averageRating` field is added to the response on the fly using
 * a simple reduce. Null is returned instead of 0 when no ratings exist, so
 * the client can distinguish "not yet rated" from "rated zero stars".
 *
 * @param {import('express').Request}  req          - Express request object.
 * @param {string}                     req.params.isbn - The 13-digit ISBN extracted from the URL path.
 * @param {import('express').Response} res          - Express response object used to send the reply.
 *
 * @returns {void} Sends one of:
 *   - HTTP 200 with `{ data: Book & { averageRating: number|null } }` when found.
 *   - HTTP 404 with `{ error: string }` when no book matches the ISBN.
 *   - HTTP 500 with `{ error: string }` if the database query fails.
 *
 * @example
 * // GET /api/books/isbn/9780132350884
 * // Successful response body
 * {
 *   "data": {
 *     "id": 1,
 *     "isbn": "9780132350884",
 *     "title": "Clean Code",
 *     "averageRating": 4.50,
 *     "ratings":  [ { "id": 1, "score": 5, "userId": 1, ... } ],
 *     "comments": [
 *       { "text": "Great book!", "user": { "id": 2, "username": "bob_codes" } }
 *     ]
 *   }
 * }
 */
const getBookByIsbn = async (req, res) => {
  // Destructure the isbn path parameter from the URL (e.g. /isbn/9780132350884 → isbn = "9780132350884")
  const { isbn } = req.params;

  try {
    const book = await prisma.book.findUnique({
      where: { isbn }, // Match the book whose isbn column equals the value from the URL

      include: {
        author:    true, // Include full Author record (name, biography)
        publisher: true, // Include Publisher record (name, discountPercent)
        genre:     true, // Include Genre record (name)

        ratings: true, // Include all Rating rows for this book (needed to compute average)

        comments: {
          include: {
            // Only expose safe user fields — explicitly exclude password, email, address.
            // Using `select` here means Prisma will NOT return any field not listed.
            user: { select: { id: true, username: true } },
          },
          orderBy: { datePosted: 'desc' }, // Show newest comments first
        },
      },
    });

    // If Prisma returns null, no book matched the given ISBN — send a 404.
    if (!book) {
      return res.status(404).json({ error: `Book with ISBN "${isbn}" not found.` });
    }

    // ── Compute Average Rating ──────────────────────────────────────────────
    // We calculate this here rather than storing it in the DB to keep the
    // data normalized — the stored ratings are the source of truth.
    const averageRating =
      book.ratings.length > 0
        ? book.ratings.reduce((sum, r) => sum + r.score, 0) / book.ratings.length
        : null; // Return null (not 0) when a book has no ratings yet

    // Spread the book object and attach the computed field before sending.
    // parseFloat + toFixed(2) rounds the average to two decimal places (e.g. 4.666… → 4.67).
    res.status(200).json({
      data: {
        ...book,
        averageRating: averageRating ? parseFloat(averageRating.toFixed(2)) : null,
      },
    });
  } catch (error) {
    // Log the full error server-side for debugging, but send only a generic
    // message to the client to avoid leaking database internals.
    console.error('getBookByIsbn error:', error);
    res.status(500).json({ error: 'Failed to retrieve book.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export the controller functions so books.routes.js can attach them
 * to the correct HTTP method + path combinations.
 */
module.exports = {
  getAllBooks,
  getBookByIsbn,
};
