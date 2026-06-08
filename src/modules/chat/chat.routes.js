import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { chatSchema, groupSchema } from './chat.validation.js';
import { createChat, createGroup, fetchChats, addUser, removeUser, pinMessage, unpinMessage, getPinnedMessages, clearChat, getClearTimestamp } from './chat.controllers.js';

const router = express.Router();

router.post("/", protect, validate(chatSchema), createChat);  // creating chat between two users
router.post("/group", protect, validate(groupSchema), createGroup); //creating a new group

router.get("/", protect, fetchChats);                  // getting all chats of a user

router.put("/add/:chatId", protect, addUser);         // adding user to a group
router.put("/remove/:chatId", protect, removeUser);     // removing user from a group

router.put("/pin/:chatId", protect, pinMessage);        //pinning a message
router.put("/unpin/:chatId", protect, unpinMessage);    //unpinning a message
router.get("/pinned/:chatId", protect, getPinnedMessages);// getting all pinned messages in a chat
router.delete("/clear/:chatId", protect, clearChat);    // clearing all messages in a chat
router.get("/cleared-timestamp/:chatId", protect, getClearTimestamp); //getting clear timestamp of a chat

export default router;