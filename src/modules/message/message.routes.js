import express from 'express';
import {protect} from '../../middleware/auth.middleware.js';
import {validate} from '../../middleware/validate.middleware.js';
import {messageSchema} from './message.validation.js';
import {sendMessage, getMessages,editMessage,deleteMessage,markSeenController,starMessage,unstarMessage,getStarredMessages,forwardMessage,searchMessages} from './message.controllers.js';

const router=express.Router();

router.post("/",protect,validate(messageSchema),sendMessage);
router.get("/:chatId",protect,getMessages);
router.put("/edit/:id",protect,editMessage);
router.delete("/delete/:id",protect,deleteMessage);
router.post("/seen/:id",protect,markSeenController);

router.post("/star/:id",protect,starMessage);
router.post("/unstar/:id",protect,unstarMessage);
router.get("/:chatId/starred",protect,getStarredMessages);
router.post("/:id/forward",protect,forwardMessage);
router.get("/:chatId/search",protect,searchMessages);

export default router;