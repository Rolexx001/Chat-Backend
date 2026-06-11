import { searchUsersService } from './user.services.js';

export const searchUsers = async (req, res, next) => {
    try {
        const query = req.query.query || req.query.search || "";
        const users = await searchUsersService(req.userId, query);
        res.status(200).json({
            success: true,
            users
        });
    } catch (error) {
        next(error);
    }
};
