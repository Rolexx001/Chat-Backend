import express from 'express';

import {signup,login,refreshTokenController,logout,getProfile,updateProfile} from './auth.controllers.js';
import {validate} from '../../middleware/validate.middleware.js';
import {signupSchema,loginSchema} from './auth.validation.js';
import {protect} from '../../middleware/auth.middleware.js';

const router=express.Router();

router.post('/signup',validate(signupSchema),signup);
router.post('/login',validate(loginSchema),login);

router.post('/refresh-token',refreshTokenController);
router.post('/logout',protect,logout);

router.get('/profile',protect,getProfile);
router.put('/profile',protect,updateProfile);

export default router;