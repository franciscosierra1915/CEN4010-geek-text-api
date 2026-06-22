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

/**
 * @function addOrUpdateRating
 * @summary  Create a new book rating or overwrite an existing one for a specific user.
 * @async
 * @param {import('express').Request}  req - Express request object. Expects body fields.
 * @param {import('express').Response} res - Express response object.
 * @returns {void} Sends HTTP 201 on success, 400 on validation failure, or 500 on server error.
 */
const addOrUpdateRating = async (req, res) => {
  // Pulling all variables from req.body to match the POST /api/ratings Postman structure
  const { score, userId, bookId } = req.body; 

  // ── Validation Rules ──────────────────────────────────────────────────────
  // 1. Check if all fields were provided in the body
  if (score === undefined || userId === undefined || bookId === undefined) {
    return res.status(400).json({ error: 'Missing required fields: score, userId, and bookId are required.' });
  }

  // 2. Enforce integer restriction and scale limits (1 to 5)
  const parsedScore = parseInt(score, 10);
  if (!Number.isInteger(score) || parsedScore < 1 || parsedScore > 5) {
    return res.status(400).json({ error: 'Validation failed: Score must be an integer between 1 and 5.' });
  }

  try {
    // ── Uniqueness Constraint & Database Logic ──────────────────────────────
    // Prisma's upsert intelligently handles updates vs insertions automatically.
    const rating = await prisma.rating.upsert({
      where: {
        // Matches the unique compound index defined in schema.prisma
        userId_bookId: {
          userId: parseInt(userId, 10),
          bookId: parseInt(bookId, 10),
        },
      },
      update: {
        score: parsedScore, // Uniqueness Constraint: subsequent attempts overwrite the old rating
      },
      create: {
        userId: parseInt(userId, 10), // First-time rating: create a brand new database record
        bookId: parseInt(bookId, 10),
        score: parsedScore,
      },
    });

    return res.status(201).json({
      message: 'Rating saved successfully.',
      data: rating,
    });
  } catch (error) {
    console.error('addOrUpdateRating error:', error);
    return res.status(500).json({ error: 'Failed to process rating due to a server error.' });
  }
};

// ── Module Exports ───────────────────────────────────────────────────────────
module.exports = {
  getBookRatings,
  addOrUpdateRating,
};