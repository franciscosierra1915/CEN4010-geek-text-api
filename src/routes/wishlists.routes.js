const express = require('express');
const router = express.Router();

const wishlistsCtrl = require('../controllers/wishlists.controller');

router.get('/:userId', wishlistsCtrl.getUserWishlists);

module.exports = router;