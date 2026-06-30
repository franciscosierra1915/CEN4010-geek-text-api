const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();



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

const getUserWishlists = async (req, res) => {
    try {
        const { userId } = req.params;
        const { currentUserId } = req.query;

        if (Number(userId) !== Number(currentUserId)) {
            return res.status(403).json({
                message: 'You do not have permission to view these wishlists.'
            });
        }

        const wishlists = await prisma.wishlist.findMany({
            where: {
                userId: Number(userId)
            }
        });

        res.json(wishlists);
    } catch (error) {
        res.status(500).json({
            message: "Failed to retrieve wishlists",
            error: error.message
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

const getWishlistById = async (req, res) => {
    try {
        const { wishlistId } = req.params;
        const { userId } = req.query;

        const wishlist = await prisma.wishlist.findUnique({
            where: {
                id: Number(wishlistId)
            },
            include: {
                items: {
                    include: {
                        book: true
                    }
                }
            }
        });

        if (!wishlist) {
            return res.status(404).json({
                message: 'Wishlist not found'
            });
        }

        if (wishlist.userId !== Number(userId)) {
            return res.status(403).json({
                message: 'You do not have permission to view this wishlist'
            });
        }

        res.json({
            id: wishlist.id,
            name: wishlist.name,
            books: wishlist.items.map(item => ({
                id: item.book.id,
                title: item.book.title,
                price: item.book.price,
                coverImageURL: item.book.coverImageURL
            }))
        })
    } catch (error) {
        return res.status(500).json({
            message: "Failed to retrieve wishlist",
            error: error.message
        });
    }

};

module.exports = {
    getUserWishlists,
    createWishlist,
    addBookToWishlist,
    moveWishlistBookToCart,
    getWishlistById
};