  /**
     * @file ratings.routes.js
     * @description Routes definition for book ratings and reviews.
     */

    const express = require('express');
    const router = express.Router();
    const ratingsCtrl = require('../controllers/ratings.controller');
    const { route } = require('./ratings.routes');

    /**
     * @route   GET /api/books/:bookId/ratings
     * @summary Retrieve all ratings and written comments for a specific book.
     * @access  Public
     * * @param   {string} bookId - The unique ID or ISBN of the target book passed in the URL.
     */

    router.post('/ratings', ratingsCtrl.addOrUpdateRating);
    router.post('/comments', ratingsCtrl.addOrUpdateComment);
    router.get('/books/:bookId/ratings', ratingsCtrl.getBookRatings);
    router.get('/books/:bookId/comments', ratingsCtrl.getBookComment);;

  

   // router.get('/:bookId/ratings', ratingsCtrl.getBookRatings);
   // router.post('/:bookId/ratings', ratingsCtrl.addOrUpdateRating);  
    module.exports = router;