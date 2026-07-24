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
/**
 * Retrieve all books whose average rating is greater than or equal
 * to the minimum rating specified by the user.
 *
 * Route:
 * GET /api/books/rating/:minRating
 */
const getBooksByMinRating = async (req, res) => {
  try {
    // Convert the URL parameter to a number
    const minRating = Number(req.params.minRating);

    // Validate that the rating is between 0 and 5
    if (isNaN(minRating) || minRating < 0 || minRating > 5) {
      return res.status(400).json({
        error: "Minimum rating must be a number between 0 and 5."
      });
    }

    // Retrieve every book along with all of its ratings
    const books = await prisma.book.findMany({
      include: {
        genre: true,
        author: true,
        ratings: true
      }
    });

    // Calculate each book's average rating and keep only the books that meet the minimum requirement
    const filteredBooks = books.map(
      book => {
        const averageRating =
          book.ratings.length === 0
            ? 0
            : book.ratings.reduce((sum, rating) => sum + rating.score, 0) /
              book.ratings.length;

        return {
          ...book,
          averageRating: Number(averageRating.toFixed(2))
        };
      })
      .filter(book => book.averageRating >= minRating);

    return res.status(200).json(filteredBooks);

  } catch (error) {
    console.error("Error retrieving books by rating:", error);

    return res.status(500).json({
      error: "Failed to retrieve books."
    });
  }
};

//----------------------------------------------------------
// discountBooksByPublisher
//----------------------------------------------------------
/**
 * Retrieve all books from a specific publisher and apply the
 * publisher's discount to each book's price.
 *
 * Route:
 * GET /api/books/publisher/:publisherId
 */
const discountBooksByPublisher = async (req, res) => {
  try {
    // Extract publisher ID from the URL
    const publisherId = Number(req.params.publisherId);
    if (isNaN(publisherId) || publisherId < 1 || publisherId > 5) {
      return res.status(400).json({
        error: "A valid publisher ID is required."
      });
    }

    // Retrieve all books for the specified publisher
    const books = await prisma.book.findMany({
      where: {
        publisherId: publisherId
      },

      // Include publisher information so we can access the publisher's discount percentage
      include: {
        publisher: true,
        author: true,
        genre: true
      }
    });

    // Apply the publisher's discount to each book
    const discountedBooks = books.map(book => {
      const discount = book.publisher.discountPercent;
      const discountedPrice =
        book.price * (1 - discount / 100);

      // Return the original book object plus pricing information
      return {
        ...book,
        originalPrice: book.price,
        discountedPrice: Number(discountedPrice.toFixed(2)),
        discountPercent: discount
      };
    });

    // Return the discounted books
    return res.status(200).json(discountedBooks);

  } catch (error) {
    console.error("Error retrieving books by publisher:", error);

    return res.status(500).json({
      error: "Failed to retrieve books by publisher."
    });
  }
};

module.exports = {
  getBooksByGenre,
  getTopSellers, 
  getBooksByMinRating, 
  discountBooksByPublisher
};