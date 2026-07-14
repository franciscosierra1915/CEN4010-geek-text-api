/**
 * @file ratings.controller.js
 * @description Controller functions for all Book Rating and Comment API endpoints.
 * @module controllers/ratings
 */
/*
const { PrismaClient } = require('@prisma/client');
const e = require('express');
// const { use } = require('react'); Created Issues with creating comment task
const prisma = new PrismaClient();
*/

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();
const validator = require('validator'); // Add this line so your comment sanitization works!

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
<<<<<<< HEAD
 
   const parsedBookId = parseInt(bookId, 10);

   //Display of individual Ratings
   const individualRatings = await prisma.rating.findMany({
=======
    const parsedBookId = parseInt(bookId, 10);

    // Display of individual Ratings
    const individualRatings = await prisma.rating.findMany({
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
      where: { bookId: parsedBookId },
      select: {
        id: true,
        score: true,
        userId: true,
        user: {
          select: { username: true }
        }
      },
      orderBy: { id: "desc" }
    });

    return res.status(200).json({
      bookId: parsedBookId,
      data: individualRatings
    });

  } catch (error) {
    console.error('getBookRatings error:', error);
    return res.status(500).json({ error: 'Failed to retrieve ratings data.' });
  }
};

/**
 * @function getBookAverageRating
 * @summary Dedicated calculation service pooling scores mathematically to format a clean decimal.
 * @async
 * @param {import('express').Request} req - Express request object. Expects bookId param.
 * @param {import('express').Response} res - Express response object.
 * @returns {JSON} Computed storefront mathematical aggregation statistics.
 */
<<<<<<< HEAD


=======
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
const getBookAverageRating = async (req, res) => {
  const { bookId } = req.params;

  try {
    const parsedBookId = parseInt(bookId, 10);

    const aggregation = await prisma.rating.aggregate({
      where: { bookId: parsedBookId },
      _avg: { score: true },
      _count: { score: true },
    });

    // Fallback logic assignment in case the target book has zero recorded scores
    const rawAverage = aggregation._avg.score || 0;
    const totalRatings = aggregation._count.score || 0;

    // Deliverable: Truncate trailing floating-point decimals into clean string format, then parse back to float
    const formattedAverage = parseFloat(rawAverage.toFixed(1));

    return res.status(200).json({
      bookId: parsedBookId,
      averageRating: formattedAverage,
      totalRatings: totalRatings
    });

  } catch (error) {
    console.error('getBookAverageRating error:', error);
    return res.status(500).json({ error: 'Failed to compute average rating.' });
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
<<<<<<< HEAD
  // Pulling all variables from req.body to match the POST /api/ratings Postman structure
  const { score, userId, bookId } = req.body; 

  // ── Validation Rules ──────────────────────────────────────────────────────
  // 1. Check if all fields were provided in the body
=======
  const { score, userId, bookId } = req.body; 

  // ── Validation Rules ──────────────────────────────────────────────────────
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
  if (score === undefined || userId === undefined || bookId === undefined) {
    return res.status(400).json({ error: 'Missing required fields: score, userId, and bookId are required.' });
  }

<<<<<<< HEAD
  // 2. Enforce integer restriction and scale limits (1 to 5)
  const parsedScore = parseInt(score, 10);
  if (!Number.isInteger(score) || parsedScore < 1 || parsedScore > 5) {
=======
  // Handle both string numbers from forms/Postman and strict integers safely
  const parsedScore = parseInt(score, 10);
  if (isNaN(parsedScore) || parsedScore < 1 || parsedScore > 5) {
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
    return res.status(400).json({ error: 'Validation failed: Score must be an integer between 1 and 5.' });
  }

  try {
    // ── Uniqueness Constraint & Database Logic ──────────────────────────────
    // Prisma's upsert handles updates vs insertions automatically.
    const rating = await prisma.rating.upsert({
      where: {
<<<<<<< HEAD
        // Matches the unique compound index defined in schema.prisma
=======
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
        userId_bookId: {
          userId: parseInt(userId, 10),
          bookId: parseInt(bookId, 10),
        },
      },
      update: {
<<<<<<< HEAD
        score: parsedScore, // Uniqueness Constraint: subsequent attempts overwrite the old rating
      },
      create: {
        userId: parseInt(userId, 10), // First-time rating: create a brand new database record
=======
        score: parsedScore, 
      },
      create: {
        userId: parseInt(userId, 10), 
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
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

/**
 * @function addOrUpdateComment
 * @summary  Sanitize and save a text-based review/comment for a specific book.
 * @async
 */
const addOrUpdateComment = async (req, res) => {
  const { text, userId, bookId } = req.body;
<<<<<<< HEAD
// ── Validation Rules ──────────────────────────────────────────────────────  
  if (!text || userId === undefined ||  bookId === undefined) {
    return res.status(400).json({ error: 'Missing required fields: text, userId, and bookId are required.' });
  }
  if (typeof text != 'string' || text.trim() == '') {
    return res.status(400).json({ error: 'Validation failed: Comment text cannot be empty.' });
  }

  try{
=======

  // ── Validation Rules ──────────────────────────────────────────────────────  
  if (!text || userId === undefined || bookId === undefined) {
    return res.status(400).json({ error: 'Missing required fields: text, userId, and bookId are required.' });
  }
  if (typeof text !== 'string' || text.trim() === '') {
    return res.status(400).json({ error: 'Validation failed: Comment text cannot be empty.' });
  }

  try {
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
    const sanitizedText = validator.escape(text.trim());

    const comment = await prisma.comment.create({
      data: {
        userId: parseInt(userId, 10),
        bookId: parseInt(bookId, 10),
        text: sanitizedText,
      },
    });

    return res.status(201).json({
      message: 'Comment posted successfully.',
      data: comment,
    });
<<<<<<< HEAD
  } catch(error){
    console.error("addOrUpdateComment error: ", error);
    return res.status(500).json({error: 'Failed to save comment due to a server error.'});
=======
  } catch (error) {
    console.error("addOrUpdateComment error: ", error);
    return res.status(500).json({ error: 'Failed to save comment due to a server error.' });
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
  }
};

/**
 * @function getBookComment
 * @summary  Fetch sorted, paginated comments for a specific book.
 * @async
 */
<<<<<<< HEAD

=======
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
const getBookComment = async (req, res) => {
  try {
    const { bookId } = req.params;

    // Parse pagination queries (Defaults to Page 1, Max 10 items)
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 10;
    const skip = (page - 1) * limit;

<<<<<<< HEAD
    //Display aspect for comments
=======
    // Display aspect for comments
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
    const comments = await prisma.comment.findMany({
      where: {
        bookId: parseInt(bookId, 10)
      },
      select: {
        id: true,
        text: true,
        datePosted: true,
        user: {
          select: {
            username: true
          }
        }
      },
      orderBy: {
        datePosted: "desc"
      },
      skip: skip,
      take: limit
    });

<<<<<<< HEAD
    //Counter of Books total comments
=======
    // Counter of Books total comments
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
    const totalComments = await prisma.comment.count({ 
      where: { bookId: parseInt(bookId, 10) }
    });

    return res.status(200).json({
      data: comments,
      pagination: {
        totalItems: totalComments,
        currentPage: page,
        totalPages: Math.ceil(totalComments / limit),
        limit: limit
      }
    });
  } catch (error) {
    console.error('Error fetching the bookcomment:', error);
    return res.status(500).json({ error: "Internal server error fetching comments." });
  }
};

<<<<<<< HEAD

=======
>>>>>>> ce23edc2fb1b63b65f1d7415c7f51122a343a989
// ── Module Exports ───────────────────────────────────────────────────────────
module.exports = {
  getBookRatings,
  getBookAverageRating,
  addOrUpdateRating,
  addOrUpdateComment,
  getBookComment,
};