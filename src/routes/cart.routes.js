/**
 * @file cart.routes.js
 * @description Express router that defines all HTTP endpoints for the Shopping Cart resource.
 *
 * This router is mounted at /api/cart in server.js, so every route defined here
 * automatically receives that prefix. For example:
 *   - router.get('/:userId)  → GET /api/cart/:userId
 *
 * Responsibility split:
 *   - This file only maps HTTP verbs + paths to controller functions.
 *   - All database queries and business logic live in cart.controller.js.
 *
 * @module routes/cart
 */

const express  = require('express');         // Express framework — provides Router factory
const router   = express.Router();           // Isolated mini-application that holds only cart routes
const cartCtrl = require('../controllers/cart.controller'); // Controller that handles the actual logic

/**
 * @route   GET /api/cart/:userId
 * @summary Retrieve all cart items belonging to a specific user.
 * @access  Public
 *
 * @param {string} userId - The ID of the user whose cart is being fetched (URL path parameter).
 *
 * @see cartCtrl.getCartByUser
 */
router.get('/:userId', cartCtrl.getCartByUser);

/** Export the configured router so server.js can mount it with app.use() */
module.exports = router;
