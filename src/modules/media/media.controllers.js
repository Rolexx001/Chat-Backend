import { saveFile, optimizeImage, deleteFile } from './media.service.js';
import User from '../../models/user.model.js';
import { mediaQueue } from '../../jobs/media.queue.js';

export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const rawUrl = await saveFile(req.file);

        // Queue background job for image optimization if it's an image
        if (req.file.mimetype.startsWith('image/')) {
            await mediaQueue.add("process-image", {
                tempPath: rawUrl,
                userId: req.userId,
                type: req.body.type || "message",
                resourceId: req.body.resourceId
            });

            return res.status(200).json({
                success: true,
                status: "processing",
                mediaUrl: rawUrl,
                filename: req.file.originalname,
            });
        }

        // For non-image files, bypass queue
        res.status(200).json({
            success: true,
            status: "ready",
            mediaUrl: rawUrl,
            filename: req.file.originalname,
        });
    } catch (error) {
        next(error);
    }
};

export const uploadAvatar = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        if (!req.file.mimetype.startsWith('image/')) {
            return res.status(400).json({ success: false, message: 'Avatar must be an image' });
        }

        const rawUrl = await saveFile(req.file);

        // Update user avatar to raw URL temporarily
        const user = await User.findByIdAndUpdate(
            req.userId,
            { avatar: rawUrl },
            { new: true }
        ).select('-password -refreshToken');

        // Queue background optimization job
        await mediaQueue.add("process-image", {
            tempPath: rawUrl,
            userId: req.userId,
            type: "avatar"
        });

        res.status(200).json({
            success: true,
            status: "processing",
            user,
            avatarUrl: rawUrl,
        });
    } catch (error) {
        next(error);
    }
};
