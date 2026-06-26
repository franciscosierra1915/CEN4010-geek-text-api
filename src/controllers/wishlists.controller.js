const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

const getUserWishlists = async (req, res) => {
    return res.json({
        message: 'getUserWishlists - coming soon'
     });
    };

const createWishlist = async (req, res) => {
    try {
        const { userId, name } = req.body;

        if (!userId) {
            return res.status(400).json({
                message: 'User ID is required'
            });
        }

        if (!name || name.trim() === '') {
            return res.status(400).json({
                message: 'Wishlist name is required'
            });
        }

        if (name.length > 50) {
            return res.status(400).json({
                message: 'Wishlist name cannot exceed 50 characters'
            });
        }

        const wishlist = await prisma.wishlist.create({
            data: {
                userId: Number(userId),
                name: name.trim()
            }
        });

        return res.status(201).json(wishlist);

    } catch (error) {

    return res.status(500).json({
        message: "Failed to create wishlist",

    });
}
};

const addBookToWishlist = async (req, res) => {
    try {
        const { wishlistId } = req.params;
        const { bookId } = req.body;

        if (!bookId) {
            return res.status(400).json({
                message: "Book ID is required"
            });
        }

        const wishlist = await prisma.wishlist.findUnique({
            where: {
                id: Number(wishlistId)
            }
        });

        if (!wishlist) {
            return res.status(404).json({
                message: 'Wishlist not found'
            });
        }

        const existingItem = await prisma.wishlistItem.findFirst({
            where: {
                wishlistId: Number(wishlistId),
                bookId: Number(bookId)
            }
        });

        if (existingItem) {
            return res.status(409).json({
                message: 'Book is already in the wishlist'
            });
        }

        const wishlistItem = await prisma.wishlistItem.create({
            data: {
                wishlistId: Number(wishlistId),
                bookId: Number(bookId)
            }
        });

        return res.status(201).json(wishlistItem);

    } catch (error) {

        return res.status(500).json({
            message: "Failed to add book to wishlist",
        });
    }
};


module.exports = {
    getUserWishlists,
    createWishlist,
    addBookToWishlist
};