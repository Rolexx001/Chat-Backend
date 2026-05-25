import express from 'express';
import { uploadFile, uploadAvatar } from './media.controllers.js';
import { uploadSingle, uploadAvatar as uploadAvatarMiddleware } from '../../middleware/upload.middleware.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/upload', protect, uploadSingle, uploadFile);
router.post('/upload-avatar', protect, uploadAvatarMiddleware, uploadAvatar);

export default router;
