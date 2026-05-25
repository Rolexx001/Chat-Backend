import { saveFile, optimizeImage, deleteFile } from '../../services/media.service.js';
import User from '../../models/user.model.js';

export const uploadFile = async (req, res, next) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: 'No file uploaded' });
        }

        const mediaUrl = await saveFile(req.file);

        res.status(200).json({
            success: true,
            mediaUrl,
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

        const avatarUrl = await optimizeImage(req.file);

        const user = await User.findByIdAndUpdate(
            req.userId,
            { avatar: avatarUrl },
            { new: true }
        ).select('-password -refreshToken');

        res.status(200).json({
            success: true,
            user,
            avatarUrl,
        });
    } catch (error) {
        next(error);
    }
};
