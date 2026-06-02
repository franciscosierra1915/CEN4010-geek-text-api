/**
 * @file books.routes.js
 * @description Express router that defines all HTTP endpoints for the Book resource.
 *
 * This router is mounted at /api/books in server.js, so every route defined here
 * automatically receives that prefix. For example:
 *   - router.get('/')            → GET /api/books
 *   - router.get('/isbn/:isbn')  → GET /api/books/isbn/:isbn
 *
 * Responsibility split:
 *   - This file only maps HTTP verbs + paths to controller functions.
 *   - All database queries and business logic live in books.controller.js.
 *
 * Sprint ownership:
 *   - Sprint 2 (Francisco — Book Details): foundation GET endpoints below.
 *   - Sprint 3+: additional endpoints are stubbed at the bottom of this file
 *     and should be implemented in the correct feature branch.
 *
 * @module routes/books
 */

const express   = require('express');          // Express framework — provides Router factory
const router    = express.Router();            // Isolated mini-application that holds only book routes
const booksCtrl = require('../controllers/books.controller'); // Controller that handles the actual logic

// ── Sprint 2 — Foundation Endpoints ──────────────────────────────────────────

/**
 * @route   GET /api/books
 * @summary Retrieve a list of every book in the catalog.
 * @access  Public
 *
 * The controller fetches all Book rows and eagerly includes their
 * related Author, Publisher, and Genre records so the client gets
 * one complete response instead of making multiple requests.
 *
 * Response shape:
 * ```json
 * {
 *   "count": 30,
 *   "data": [ { "id": 1, "title": "...", "author": {...}, ... }, ... ]
 * }
 * ```
 *
 * @see booksCtrl.getAllBooks
 */
router.get('/', booksCtrl.getAllBooks);

/**
 * @route   GET /api/books/isbn/:isbn
 * @summary Retrieve a single book by its ISBN, with full details.
 * @access  Public
 *
 * @param {string} isbn - The 13-digit ISBN of the book (URL path parameter).
 *
 * In addition to the fields returned by the list endpoint, this response
 * also includes all user Ratings and Comments for the book, plus a computed
 * averageRating field. Comments include the commenter's username (but not
 * their password or email, which remain private).
 *
 * Response shape on success:
 * ```json
 * {
 *   "data": {
 *     "id": 1,
 *     "isbn": "9780132350884",
 *     "title": "...",
 *     "averageRating": 4.50,
 *     "ratings":  [ { "score": 5, ... } ],
 *     "comments": [ { "text": "...", "user": { "username": "alice_dev" } } ]
 *   }
 * }
 * ```
 *
 * Returns HTTP 404 if no book with the given ISBN exists.
 *
 * @see booksCtrl.getBookByIsbn
 */
router.get('/isbn/:isbn', booksCtrl.getBookByIsbn);

// ── Sprint 3+ Placeholder Routes ──────────────────────────────────────────────
// These are stubs for endpoints planned in future sprints.
// Uncomment each line in the correct feature branch when ready to implement.

// GET /api/books/genre/:genreId
//   Book Browsing feature: returns all books that belong to a specific genre.
// router.get('/genre/:genreId', booksCtrl.getBooksByGenre);

// GET /api/books/top-sellers
//   Book Browsing feature: returns the top 10 books ranked by copiesSold descending.
// router.get('/top-sellers', booksCtrl.getTopSellers);

// GET /api/books/rating/:minRating
//   Book Browsing feature: returns all books whose average rating is >= minRating.
// router.get('/rating/:minRating', booksCtrl.getBooksByMinRating);

// GET /api/books/publisher/:publisherId
//   Book Browsing feature: returns all books from a publisher with the publisher's discount applied.
// router.get('/publisher/:publisherId', booksCtrl.getBooksByPublisher);

// POST /api/books
//   Book Details (admin) feature: creates a new book record.
// router.post('/', booksCtrl.createBook);

// PATCH /api/books/:id/price
//   Book Details (admin) feature: updates the price of an existing book.
// router.patch('/:id/price', booksCtrl.updateBookPrice);

// POST /api/books/:id/authors
//   Book Details (admin) feature: associates an additional author with a book.
// router.post('/:id/authors', booksCtrl.addAuthorToBook);

/** Export the configured router so server.js can mount it with app.use() */
module.exports = router;
