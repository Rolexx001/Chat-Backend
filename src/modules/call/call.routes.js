import express from 'express';
import { getCallHistory, getIceServers } from './call.controllers.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.get('/history', protect, getCallHistory);
router.get('/ice-servers', protect, getIceServers);

export default router;
