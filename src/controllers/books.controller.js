// src/controllers/books.controller.js
// Geek Text API — Books Controller
//
// Handles all business logic for book-related endpoints.
// Each function receives (req, res) from the router and uses
// Prisma Client to query the PostgreSQL database.

const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

// ─────────────────────────────────────────────
//  GET /api/books
//  Returns all books with author, publisher, and genre included.
// ─────────────────────────────────────────────
const getAllBooks = async (req, res) => {
  try {
    const books = await prisma.book.findMany({
      include: {
        author:    true,
        publisher: true,
        genre:     true,
      },
      orderBy: { title: 'asc' },
    });

    res.status(200).json({
      count: books.length,
      data:  books,
    });
  } catch (error) {
    console.error('getAllBooks error:', error);
    res.status(500).json({ error: 'Failed to retrieve books.' });
  }
};

// ─────────────────────────────────────────────
//  GET /api/books/isbn/:isbn
//  Returns a single book by ISBN with full details:
//  author, publisher, genre, all ratings, and all comments.
// ─────────────────────────────────────────────
const getBookByIsbn = async (req, res) => {
  const { isbn } = req.params;

  try {
    const book = await prisma.book.findUnique({
      where: { isbn },
      include: {
        author:    true,
        publisher: true,
        genre:     true,
        ratings:   true,
        comments: {
          include: {
            // Return the commenter's username but NOT their password
            user: { select: { id: true, username: true } },
          },
          orderBy: { datePosted: 'desc' },
        },
      },
    });

    if (!book) {
      return res.status(404).json({ error: `Book with ISBN "${isbn}" not found.` });
    }

    // Compute average rating on the fly
    const averageRating =
      book.ratings.length > 0
        ? book.ratings.reduce((sum, r) => sum + r.score, 0) / book.ratings.length
        : null;

    res.status(200).json({
      data: {
        ...book,
        averageRating: averageRating ? parseFloat(averageRating.toFixed(2)) : null,
      },
    });
  } catch (error) {
    console.error('getBookByIsbn error:', error);
    res.status(500).json({ error: 'Failed to retrieve book.' });
  }
};

module.exports = {
  getAllBooks,
  getBookByIsbn,
};
