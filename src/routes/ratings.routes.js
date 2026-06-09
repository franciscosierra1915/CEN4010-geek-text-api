/**
 * @file ratings.routes.js
 * @description Routes definition for book ratings and reviews.
 */

const express = require('express');
const router = express.Router();
const ratingsCtrl = require('../controllers/ratings.controller');

// GET /api/books/:bookId/ratings — Retrieve all ratings for a specific book
router.get('/:bookId/ratings', ratingsCtrl.getBookRatings);

module.exports = router;