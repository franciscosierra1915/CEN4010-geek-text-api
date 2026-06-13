/**
 * @file ratings.controller.js
 * @description Controller functions for all Book Rating and Comment API endpoints.
 * @module controllers/ratings
 */

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

/**
 * @function getBookRatings
 * @summary Fetch all ratings and comments for a specific book.
 * @async
 * @param {import('express').Request} req - Express request object. Expects bookId param.
 * @param {import('express').Response} res - Express response object.
 */
const getBookRatings = async (req, res) => {
  // Extract bookId from the URL path parameter (/books/:bookId/ratings)
  const { bookId } = req.params;

  try {
    // Sprint 2 placeholder response as requested by instructions
    return res.json({ 
      message: "getBookRatings - coming soon",
      requestedBookId: bookId 
    });
  } catch (error) {
    console.error('getBookRatings error:', error);
    res.status(500).json({ error: 'Failed to retrieve ratings.' });
  }
};

module.exports = {
  getBookRatings,
};