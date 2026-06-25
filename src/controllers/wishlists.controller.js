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
    console.error(error);

    return res.status(500).json({
        message: "Failed to create wishlist",
        error: error.message
    });
}
};

module.exports = {
    getUserWishlists,
    createWishlist
};