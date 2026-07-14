/**
 * @file ratings.routes.js
 * @description Routes definition for Book Rating and Commenting features.
 */

const express = require('express');
const router = express.Router();
const ratingsCtrl = require('../controllers/ratings.controller');

<<<<<<< HEAD

// ── GET Endpoints ──────────────────────────────────────────────────────────

// GET /api/books/:bookId/ratings/average — Calculates average decimal rating strictly
router.get('/books/:bookId/ratings/average', ratingsCtrl.getBookAverageRating)

// GET /api/books/:bookId/ratings — Retrieves all individual rating records
router.get('/books/:bookId/ratings', ratingsCtrl.getBookRatings);

// GET /api/books/:bookId/comments — Retrieves the sorted, paginated list of comments
router.get('/books/:bookId/comments', ratingsCtrl.getBookComment);


// ── POST Endpoints ─────────────────────────────────────────────────────────

// POST /api/ratings — Creates or updates a user rating on a 5-star scale
router.post('/ratings', ratingsCtrl.addOrUpdateRating);

// POST /api/comments — Creates a new text-based book review/comment
=======
// ── GET Endpoints ──────────────────────────────────────────────────────────
router.get('/books/:bookId/ratings/average', ratingsCtrl.getBookAverageRating);
router.get('/books/:bookId/ratings', ratingsCtrl.getBookRatings);
router.get('/books/:bookId/comments', ratingsCtrl.getBookComment);

// ── POST Endpoints ─────────────────────────────────────────────────────────
router.post('/ratings', ratingsCtrl.addOrUpdateRating);
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
router.post('/comments', ratingsCtrl.addOrUpdateComment);

module.exports = router;