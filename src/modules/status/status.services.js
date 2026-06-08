import Status from '../../models/status.model.js';
import User from '../../models/user.model.js';
import { fetchUserChats } from '../chat/chat.services.js';
import { deleteFile } from '../media/media.service.js';

export const createStatusService = async (userId, mediaUrl, caption) => {
    const status = new Status({
        user: userId,
        mediaUrl,
        caption: caption || ''
    });
    await status.save();
    return status;
};

export const getStatusFeedService = async (userId) => {
    // Get blocked and blockers
    const currentUser = await User.findById(userId).select('blockedUser');
    const blockers = await User.find({ blockedUser: userId }).select('_id');

    const blockedSet = new Set([
        ...(currentUser?.blockedUser || []).map(id => id.toString()),
        ...blockers.map(u => u._id.toString())
    ]);

    // Get all user chats to find "contacts"
    const chats = await fetchUserChats(userId);
    const participantIds = new Set();

    chats.forEach(chat => {
        chat.participants.forEach(p => {
            const pIdStr = typeof p === 'object' && p._id ? p._id.toString() : p.toString();
            if (pIdStr !== userId.toString() && !blockedSet.has(pIdStr)) {
                participantIds.add(pIdStr);
            }
        });
    });

    if (participantIds.size === 0) return [];

    const statuses = await Status.find({           //sare status of all participant of that user 
        user: { $in: Array.from(participantIds) },
        expiresAt: { $gt: new Date() }
    })
        .populate('user', 'name email avatar')
        .sort({ createdAt: -1 });

    // Grouping of status by userids   like particular participant ke status sath mei
    const grouped = {};
    statuses.forEach(status => {
        const uId = status.user._id.toString();
        if (!grouped[uId]) {
            grouped[uId] = {
                user: status.user,
                stories: []
            };
        }
        grouped[uId].stories.push(status);
    });

    return Object.values(grouped);
};

export const getMyStatusesService = async (userId) => {
    return await Status.find({
        user: userId,
        expiresAt: { $gt: new Date() }
    }).sort({ createdAt: -1 });
};

export const viewStatusService = async (userId, statusId) => {
    const status = await Status.findById(statusId);
    if (!status) {
        throw new Error("Status not found");
    }

    if (status.expiresAt <= new Date()) {
        throw new Error("Status has expired");
    }

    // Check if blocked/blocker relation exists
    const statusOwnerId = status.user.toString();
    const isViewerBlocked = await User.exists({ _id: statusOwnerId, blockedUser: userId });
    const isOwnerBlocked = await User.exists({ _id: userId, blockedUser: statusOwnerId });
    if (isOwnerBlocked || isViewerBlocked) {
        throw new Error("Unauthorized to view status");
    }

    // Record view
    await Status.findByIdAndUpdate(statusId, {
        $addToSet: {
            viewers: { user: userId, viewedAt: new Date() }
        }
    });

    return { success: true, message: "Status viewed successfully" };
};

export const getStatusViewersService = async (userId, statusId) => {
    const status = await Status.findById(statusId).populate('viewers.user', 'name email avatar');
    if (!status) {
        throw new Error("Status not found");
    }

    if (status.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized to view list of viewers");
    }

    return status.viewers;
};

export const deleteStatusService = async (userId, statusId) => {
    const status = await Status.findById(statusId);
    if (!status) {
        throw new Error("Status not found");
    }

    if (status.user.toString() !== userId.toString()) {
        throw new Error("Unauthorized to delete this status");
    }

    // Delete media file from storage
    if (status.mediaUrl) {
        const relativePath = status.mediaUrl.startsWith('/') ? status.mediaUrl.slice(1) : status.mediaUrl;
        await deleteFile(relativePath);
    }

    await Status.findByIdAndDelete(statusId);
    return { success: true, message: "Status deleted successfully" };
};
