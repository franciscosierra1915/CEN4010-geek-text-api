const { PrismaClient } = require('@prisma/client'); 
const prisma = new PrismaClient();

//----------------------------------------------------------
// getBooksByGenre
//----------------------------------------------------------
/**
 * Retrieve all books that belong to a specific genre.
 *
 * Route:
 * GET /api/books/genre/:genre
 */
const getBooksByGenre = async (req, res) => {
  try {
    const genreName = req.params.genre;

    if (!genreName) {
      return res.status(400).json({
        error: 'Genre parameter is required.'
      });
    }

    const books = await prisma.book.findMany({
      where: {
        genre: {
          name: {
            equals: genreName,
            mode: 'insensitive'
          }
        }
      },

      include: {
        genre: true,
        author: true,
        publisher: true
      }
    });

    return res.status(200).json(books);

  } catch (error) {
    console.error('Error retrieving books by genre:', error);

    return res.status(500).json({
      error: 'Failed to retrieve books.'
    });
  }
};

//----------------------------------------------------------
// getTopSellers
//----------------------------------------------------------
/**
 * Retrieve the top 10 best-selling books.
 *
 * Route:
 * GET /api/books/top-sellers
 */
const getTopSellers = async (req, res) => {
  try {
    const topBooks = await prisma.book.findMany({
      orderBy: {
        copiesSold: 'desc'
      },

      take: 10,

      include: {
        genre: true
      }
    });

    //If the system is brand new and has no sales yet, it should gracefully return the newest 10 books or an empty list rather than crashing.
    const hasSales = topBooks.some(book => book.copiesSold > 0);
      if (!hasSales) {
        const newestBooks = await prisma.book.findMany({
          orderBy: {
            createdAt: 'desc'
          },
          take: 10
        });

        return res.status(200).json(newestBooks);
      }

    return res.status(200).json(topBooks);

  } catch (error) {
      console.error('Error retrieving top sellers:', error);

    return res.status(500).json({
      error: 'Failed to retrieve top-selling books.'
    });
  }
};

//----------------------------------------------------------
// getBooksByMinRating
//----------------------------------------------------------



//----------------------------------------------------------
// getBooksByPublisher
//----------------------------------------------------------




module.exports = {
  getBooksByGenre,
  getTopSellers
};