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

const moveWishlistBookToCart = async (req, res) => {
    try {
        const { wishlistId, bookId } = req.params;

        const result = await prisma.$transaction(async (tx) => {

            const wishlistItem = await tx.wishlistItem.findFirst({
                where: {
                    wishlistId: Number(wishlistId),
                    bookId: Number(bookId)
                },
                include: {
                    wishlist: true
                }
            });

            if (!wishlistItem) {
                throw new Error('Book is not in this wishlist');
            }

            const book = await tx.book.findUnique({
                where: {
                    id: Number(bookId)
                }
            });

            if (!book || book.stock <= 0) {
                throw new Error('Book is out of stock');
            }

            const cartItem = await tx.cartItem.create({
                data: {
                    bookId: Number(bookId),
                    userId: wishlistItem.wishlist.userId
                }
            });

            await tx.wishlistItem.delete({
                where: {
                    id: wishlistItem.id
                }
            });

            return cartItem;

        });

        return res.status(200).json({
            message: "Book moved from wishlist to shopping cart successfully",
            cartItem: result
        });
    } catch (error) {
        return res.status(400).json({
            message: "Failed to move book to cart",
            error: error.message
        });
    }
};

module.exports = {
    getUserWishlists,
    createWishlist,
    addBookToWishlist,
    moveWishlistBookToCart

};