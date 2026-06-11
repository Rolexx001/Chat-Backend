import express from 'express';
import { searchUsers } from './user.controllers.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/search', protect, searchUsers);
router.get('/', protect, searchUsers);

export default router;
