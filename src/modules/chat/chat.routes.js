import express from 'express';
import {protect} from '../../middleware/auth.middleware.js';
import {validate} from '../../middleware/validate.middleware.js';
import {chatSchema,groupSchema} from './chat.validation.js';
import {createChat,createGroup,fetchChats,addUser,removeUser,pinMessage,unpinMessage,getPinnedMessages,clearChat,getClearTimestamp} from './chat.controllers.js';

const router=express.Router();

router.post("/",protect,validate(chatSchema),createChat);
router.post("/group",protect,validate(groupSchema),createGroup);

router.get("/",protect,fetchChats);

router.put("/add/:chatId",protect,addUser);
router.put("/remove/:chatId",protect,removeUser);

router.put("/pin/:chatId",protect,pinMessage);
router.put("/unpin/:chatId",protect,unpinMessage);
router.get("/pinned/:chatId",protect,getPinnedMessages);
router.delete("/clear/:chatId",protect,clearChat);
router.get("/cleared-timestamp/:chatId",protect,getClearTimestamp);

export default router;