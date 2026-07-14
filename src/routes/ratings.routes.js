/**
 * @file ratings.routes.js
 * @description Routes definition for Book Rating and Commenting features.
 */

const express = require('express');
const router = express.Router();
const ratingsCtrl = require('../controllers/ratings.controller');

// ── GET Endpoints ──────────────────────────────────────────────────────────
router.get('/books/:bookId/ratings/average', ratingsCtrl.getBookAverageRating);
router.get('/books/:bookId/ratings', ratingsCtrl.getBookRatings);
router.get('/books/:bookId/comments', ratingsCtrl.getBookComment);

// ── POST Endpoints ─────────────────────────────────────────────────────────
router.post('/ratings', ratingsCtrl.addOrUpdateRating);
router.post('/comments', ratingsCtrl.addOrUpdateComment);

module.exports = router;