/**
 * @file browsing.routes.js
 * @description Routes definition for book browsing and sorting.
 */

const express = require('express');
const router = express.Router();
const browsingCtrl = require('../controllers/browsing.controller');


router.get('/genre/:genre', browsingCtrl.getBooksByGenre);
router.get('/top-sellers', browsingCtrl.getTopSellers);
router.get('/rating/:minRating', browsingCtrl.getBooksByMinRating);
router.get('/publisher/:publisherId', browsingCtrl.discountBooksByPublisher);


module.exports = router;