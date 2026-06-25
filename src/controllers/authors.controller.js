/**
 * @file authors.controller.js
 * @description Controller functions for all Author-related API endpoints.
 *
 * A controller function receives the Express (req, res) pair from the router,
 * executes any required business logic or database queries, and sends the HTTP
 * response back to the client.
 *
 * All database access goes through Prisma Client, which translates JavaScript
 * method calls into type-safe SQL queries against the PostgreSQL database.
 *
 * @module controllers/authors
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
//  createAuthor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function createAuthor
 * @summary  Create a new author record (admin feature).
 * @async
 *
 * Implements the "Book Details" checklist item:
 *   "An administrator must be able to create an author with first name,
 *    last name, biography and publisher."
 *
 * firstName and lastName are required. biography and publisherId are optional —
 * an author can exist without a known publisher or biography yet. When publisherId
 * is provided, it must reference an existing Publisher row; Prisma enforces this
 * via a foreign-key constraint, which we translate into a 400 (not a 500) since
 * an invalid publisherId is a client input error, not a server fault.
 *
 * @param {import('express').Request}  req      - Express request object.
 * @param {Object}                     req.body - Author Object.
 * @param {string}                     req.body.firstName   - Author's given name. Required.
 * @param {string}                     req.body.lastName    - Author's family name. Required.
 * @param {string}                     [req.body.biography] - Short biography. Optional.
 * @param {number}                     [req.body.publisherId] - Id of an existing Publisher. Optional.
 * @param {import('express').Response} res      - Express response object used to send the reply.
 *
 * @returns {void} Sends one of:
 *   - HTTP 201 with `{ data: Author }` on success (per REST convention for POST —
 *     the checklist's "Response Data: None" just means no specific shape is graded;
 *     returning the created record's id is what lets a client immediately link
 *     this author to a book).
 *   - HTTP 400 with `{ error: string }` if firstName/lastName are missing, or
 *     publisherId does not reference an existing Publisher.
 *   - HTTP 500 with `{ error: string }` if the database operation fails unexpectedly.
 *
 * @example
 * // POST /api/authors
 * // Request body
 * { "firstName": "Kent", "lastName": "Beck", "biography": "...", "publisherId": 2 }
 *
 * // Successful response body (HTTP 201)
 * {
 *   "data": {
 *     "id": 11,
 *     "firstName": "Kent",
 *     "lastName": "Beck",
 *     "biography": "...",
 *     "publisherId": 2,
 *     "publisher": { "id": 2, "name": "O'Reilly Media", "discountPercent": 0 }
 *   }
 * }
 */
const createAuthor = async (req, res) => {
  const { firstName, lastName, biography, publisherId } = req.body ?? {};

  // ── Validation ──────────────────────────────────────────────────────────
  // firstName and lastName are the only required fields per the checklist.
  if (typeof firstName !== 'string' || firstName.trim() === '') {
    return res.status(400).json({ error: 'firstName is required and must be a non-empty string.' });
  }
  if (typeof lastName !== 'string' || lastName.trim() === '') {
    return res.status(400).json({ error: 'lastName is required and must be a non-empty string.' });
  }
  if (biography !== undefined && biography !== null && typeof biography !== 'string') {
    return res.status(400).json({ error: 'biography must be a string when provided.' });
  }

  // publisherId is optional, but if the client sends one it must be a valid integer.
  // Number("") is 0 and Number(null) is 0, so we explicitly exclude null/undefined
  // first and only coerce real values — otherwise a stray null/empty value would
  // be misread as publisherId = 0.
  let normalizedPublisherId = null;
  if (publisherId !== undefined && publisherId !== null && publisherId !== '') {
    normalizedPublisherId = Number(publisherId);
    if (!Number.isInteger(normalizedPublisherId)) {
      return res.status(400).json({ error: 'publisherId must be an integer.' });
    }
  }

  try {
    const author = await prisma.author.create({
      data: {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        biography: biography ?? null,
        publisherId: normalizedPublisherId,
      },
      include: {
        publisher: true, // Return the linked Publisher (if any) so the client doesn't need a second request
      },
    });

    // HTTP 201 (Created) is the conventional success status for POST, per the
    // course's REST API Expectations slides — not 200.
    res.status(201).json({ data: author });
  } catch (error) {
    // Prisma error code P2003 = foreign key constraint violation.
    // This means the client supplied a publisherId that doesn't exist —
    // a bad request (400), not a server failure (500).
    if (error.code === 'P2003') {
      return res.status(400).json({ error: `Publisher with id ${publisherId} does not exist.` });
    }

    console.error('createAuthor error:', error);
    res.status(500).json({ error: 'Failed to create author.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  getBooksByAuthor
// ─────────────────────────────────────────────────────────────────────────────

/**
 * @function getBooksByAuthor
 * @summary  Fetch every book written by a given author.
 * @async
 *
 * Implements the "Book Details" checklist item:
 *   "Must be able to retrieve a list of books associated with an author."
 *
 * Looks the author up first (via `findUnique`) rather than going straight to
 * `book.findMany({ where: { authorId } })`, because that's the only way to
 * tell "author exists but has written zero books" (200 with an empty array)
 * apart from "no author with this id" (404) — a bare findMany on Book would
 * return an empty array in both cases and hide a bad authorId from the client.
 *
 * @param {import('express').Request}  req            - Express request object.
 * @param {string}                     req.params.id  - The author's id (URL path parameter).
 * @param {import('express').Response} res            - Express response object used to send the reply.
 *
 * @returns {void} Sends one of:
 *   - HTTP 200 with `{ count: number, data: Book[] }` when the author exists
 *     (data is `[]` if they have no books yet).
 *   - HTTP 400 with `{ error: string }` if the id is not a valid integer.
 *   - HTTP 404 with `{ error: string }` if no author has that id.
 *   - HTTP 500 with `{ error: string }` if the database query fails.
 *
 * @example
 * // GET /api/authors/3/books
 * // Successful response body
 * {
 *   "count": 2,
 *   "data": [
 *     { "id": 5, "isbn": "9780132350884", "title": "Clean Code", "publisher": {...}, "genre": {...} },
 *     { "id": 9, "isbn": "9780134494166", "title": "Clean Architecture", "publisher": {...}, "genre": {...} }
 *   ]
 * }
 */
const getBooksByAuthor = async (req, res) => {
  const { id } = req.params;

  // ── Validation ──────────────────────────────────────────────────────────
  // Number(undefined) is NaN and Number('') is 0, so we explicitly reject
  // missing/empty values before coercing — same guard used elsewhere in this file.
  const numericId = Number(id);
  if (id === undefined || id === null || id === '' || !Number.isInteger(numericId)) {
    return res.status(400).json({ error: 'Author id must be an integer.' });
  }

  try {
    const author = await prisma.author.findUnique({
      where: { id: numericId },
      include: {
        books: {
          include: {
            publisher: true, // Joins the Publisher table — includes discount info
            genre:     true, // Joins the Genre table — returns the genre name
          },
          orderBy: { title: 'asc' }, // Sort alphabetically by title, matching getAllBooks
        },
      },
    });

    // If Prisma returns null, no author matched the given id — send a 404.
    if (!author) {
      return res.status(404).json({ error: `Author with id ${numericId} not found.` });
    }

    res.status(200).json({
      count: author.books.length, // Total number of books returned
      data:  author.books,        // Array of book objects with nested publisher/genre
    });
  } catch (error) {
    console.error('getBooksByAuthor error:', error);
    res.status(500).json({ error: 'Failed to retrieve books for author.' });
  }
};

// ─────────────────────────────────────────────────────────────────────────────
//  Exports
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Export the controller functions so authors.routes.js can attach them
 * to the correct HTTP method + path combinations.
 */
module.exports = {
  createAuthor,
  getBooksByAuthor,
};
