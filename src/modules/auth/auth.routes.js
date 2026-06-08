import express from 'express';

import {
    signup,
    login,
    refreshTokenController,
    logout,
    getProfile,
    updateProfile,
    blockUser,
    unblockUser,
    getBlockedUsers,
    reportUser,
    getSessions,
    revokeSession,
    revokeAllSessionsExceptCurrent
} from './auth.controllers.js';
import { validate } from '../../middleware/validate.middleware.js';
import { signupSchema, loginSchema } from './auth.validation.js';
import { protect } from '../../middleware/auth.middleware.js';

const router = express.Router();

router.post('/signup', validate(signupSchema), signup);  //signing up
router.post('/login', validate(loginSchema), login);    //logging in

router.post('/refresh-token', refreshTokenController);  //refreshing token
router.post('/logout', protect, logout);                //logging out

router.get('/profile', protect, getProfile);          //getting profile
router.put('/profile', protect, updateProfile);       //updating profile



router.post('/block', protect, blockUser);              //blocking user
router.post('/unblock', protect, unblockUser);          //unblocking user
router.get('/blocked', protect, getBlockedUsers);       //getting blocked users
router.post('/report', protect, reportUser);            //reporting user

router.get('/devices', protect, getSessions);           //getting all sessions of current user
router.delete('/devices/:sessionId', protect, revokeSession);      //revoking a session
router.delete('/devices', protect, revokeAllSessionsExceptCurrent); //revoking all sessions except current

export default router;