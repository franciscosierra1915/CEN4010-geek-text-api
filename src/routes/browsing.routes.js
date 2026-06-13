const express = require('express');
const router = express.Router();

const browsingCtrl = require('../controllers/browsing.controller');

router.get(
  '/genre/:genreId',
  browsingCtrl.getBooksByGenre
);

module.exports = router;