import User from '../../models/user.model.js';

export const searchUsersService = async (currentUserId, searchQuery) => {
    const currentUser = await User.findById(currentUserId).select('blockedUser');
    const blockedUsers = currentUser?.blockedUser || [];

    let query = {
        _id: { $nin: [currentUserId, ...blockedUsers] },
        blockedUser: { $ne: currentUserId }
    };

    if (searchQuery) {
        const escapedSearchQuery = searchQuery.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, '\\$&');
        query.$or = [
            { name: { $regex: escapedSearchQuery, $options: 'i' } },
            { email: { $regex: escapedSearchQuery, $options: 'i' } }
        ];
    }

    return await User.find(query).select('name email avatar bio isOnline lastSeen');
};
