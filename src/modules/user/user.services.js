import User from '../../models/user.model.js';

export const searchUsersService = async (currentUserId, searchQuery) => {
    let query = { _id: { $ne: currentUserId } };
    
    if (searchQuery) {
        query.$or = [
            { name: { $regex: searchQuery, $options: 'i' } },
            { email: { $regex: searchQuery, $options: 'i' } }
        ];
    }
    
    return await User.find(query).select('name email avatar bio isOnline lastSeen');
};
