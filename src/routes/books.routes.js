// src/routes/books.routes.js
// Geek Text API — Book Routes
//
// Mounted at /api/books in server.js
//
// Sprint 2 (Francisco — Book Details feature):
//   GET /api/books              → return all books
//   GET /api/books/isbn/:isbn   → return one book by ISBN
//
// Sprint 3+ endpoints will be added here by the Book Details and
// Book Browsing feature owners as their branches are merged.

const express    = require('express');
const router     = express.Router();
const booksCtrl  = require('../controllers/books.controller');

// ── Sprint 2 Foundation Endpoints ────────────────────────────────────────────

// GET /api/books
// Returns a list of all books with author, publisher, and genre info.
router.get('/', booksCtrl.getAllBooks);

// GET /api/books/isbn/:isbn
// Returns a single book by ISBN with full details including ratings and comments.
router.get('/isbn/:isbn', booksCtrl.getBookByIsbn);

// ── Sprint 3+ Placeholders ────────────────────────────────────────────────────
// Uncomment and implement in the correct feature branch:

// GET /api/books/genre/:genreId          → Book Browsing: retrieve by genre
// GET /api/books/top-sellers             → Book Browsing: top 10 selling books
// GET /api/books/rating/:minRating       → Book Browsing: books by minimum rating
// GET /api/books/publisher/:publisherId  → Book Browsing: books by publisher with discount

// POST   /api/books                      → Book Details: create a new book (admin)
// PATCH  /api/books/:id/price            → Book Details: update book price
// POST   /api/books/:id/authors          → Book Details: add author to book

module.exports = router;
