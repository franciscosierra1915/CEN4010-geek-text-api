/**
 * @file wishlists.routes.js
 * @description Express router that defines all HTTP endpoints for the Wishlist resource.
 *
 * This router is mounted at /api/wishlists in server.js, so every route defined
 * here automatically receives that prefix. For example:
 *   - router.get('/:userId') → GET /api/wishlists/:userId
 *
 * Responsibility split:
 *   - This file only maps HTTP verbs + paths to controller functions.
 *   - All database queries and business logic live in wishlists.controller.js.
 *
 * @module routes/wishlists
 */

const express = require('express');
const router = express.Router();
const wishlistsCtrl = require('../controllers/wishlists.controller');

router.get('/:userId', wishlistsCtrl.getUserWishlists);

/**
 * @route   GET /api/wishlists/:userId
 * @summary Retrieve all wishlists belonging to a user.
 * @access  Public
 *
 * @param {number} userId - The user's ID.
 *
 * @see wishlistsCtrl.getUserWishlists
 */


router.post('/', wishlistsCtrl.createWishlist);
/**
 * @route   POST /api/wishlists
 * @summary Create a new wishlist.
 * @access  Public
 *
 * The controller creates a new wishlist for a user based on the
 * request body.
 *
 * @see wishlistsCtrl.createWishlist
 */


/** Export the configured router so server.js can mount it with app.use() */
module.exports = router;