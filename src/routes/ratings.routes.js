  /**
     * @file ratings.routes.js
     * @description Routes definition for book ratings and reviews.
     */

    const express = require('express');
    const router = express.Router();
    const ratingsCtrl = require('../controllers/ratings.controller');
    const { route } = require('./ratings.routes');

<<<<<<< HEAD
    /**
     * @route   GET /api/books/:bookId/ratings
     * @summary Retrieve all ratings and written comments for a specific book.
     * @access  Public
     * * @param   {string} bookId - The unique ID or ISBN of the target book passed in the URL.
     */
=======

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
router.post('/comments', ratingsCtrl.addOrUpdateComment);
>>>>>>> 15d34c2 (feat: complete sprint 3 book rating and commenting features)

    router.post('/ratings', ratingsCtrl.addOrUpdateRating);
    router.post('/comments', ratingsCtrl.addOrUpdateComment);
    router.get('/books/:bookId/ratings', ratingsCtrl.getBookRatings);
    router.get('/books/:bookId/comments', ratingsCtrl.getBookComment);;

  

   // router.get('/:bookId/ratings', ratingsCtrl.getBookRatings);
   // router.post('/:bookId/ratings', ratingsCtrl.addOrUpdateRating);  
    module.exports = router;