/**
 * @file authors.routes.js
 * @description Express router that defines all HTTP endpoints for the Author resource.
 *
 * This router is mounted at /api/authors in server.js, so every route defined here
 * automatically receives that prefix. For example:
 *   - router.post('/') → POST /api/authors
 *
 * Responsibility split:
 *   - This file only maps HTTP verbs + paths to controller functions.
 *   - All database queries and business logic live in authors.controller.js.
 *
 * Sprint ownership:
 *   - Issue #7 ("Book Details: Create author") — POST endpoint below.
 *   - Issue #8 ("Book Details: Retrieve books by author") — GET endpoint below.
 *
 * @module routes/authors
 */

const express     = require('express');           // Express framework — provides Router factory
const router      = express.Router();              // Isolated mini-application that holds only author routes
const authorsCtrl = require('../controllers/authors.controller'); // Controller that handles the actual logic

/**
 * @route   POST /api/authors
 * @summary Create a new author (admin feature).
 * @access  Admin
 *
 * Request body (Author Object):
 * ```json
 * { "firstName": "Kent", "lastName": "Beck", "biography": "...", "publisherId": 2 }
 * ```
 * firstName and lastName are required; biography and publisherId are optional.
 *
 * Returns HTTP 201 with the created author on success, 400 on invalid input
 * (missing required fields or a publisherId that doesn't exist).
 *
 * @see authorsCtrl.createAuthor
 */
router.post('/', authorsCtrl.createAuthor);

/**
 * @route   GET /api/authors/:id/books
 * @summary Retrieve every book written by a given author.
 * @access  Public
 *
 * @param {string} id - The author's id (URL path parameter).
 *
 * Response shape on success:
 * ```json
 * {
 *   "count": 2,
 *   "data": [ { "id": 5, "isbn": "...", "title": "...", "publisher": {...}, "genre": {...} }, ... ]
 * }
 * ```
 *
 * Returns HTTP 404 if no author with the given id exists; HTTP 200 with an
 * empty `data` array if the author exists but hasn't written any books yet.
 *
 * @see authorsCtrl.getBooksByAuthor
 */
router.get('/:id/books', authorsCtrl.getBooksByAuthor);

/** Export the configured router so server.js can mount it with app.use() */
module.exports = router;
