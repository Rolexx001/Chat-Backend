import express from 'express';
import {
    createStatus,
    getStatusFeed,
    getMyStatuses,
    viewStatus,
    getStatusViewers,
    deleteStatus
} from './status.controllers.js';
import { protect } from '../../middleware/auth.middleware.js';
import { uploadSingle } from '../../middleware/upload.middleware.js';


const router = express.Router();

router.post('/', protect, uploadSingle, createStatus);  //creating status
router.get('/', protect, getStatusFeed);   //getting all status of all participants of mine
router.get('/me', protect, getMyStatuses);  //getting my status
router.post('/:statusId/view', protect, viewStatus);  //viewing status
router.get('/:statusId/viewers', protect, getStatusViewers); //getting list of all viewers
router.delete('/:statusId', protect, deleteStatus); //deleting status

export default router;
