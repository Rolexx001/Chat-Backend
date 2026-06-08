import express from 'express';
import { protect } from '../../middleware/auth.middleware.js';
import { validate } from '../../middleware/validate.middleware.js';
import { messageSchema } from './message.validation.js';
import { sendMessage, getMessages, editMessage, deleteMessage, markSeenController, starMessage, unstarMessage, getStarredMessages, forwardMessage, searchMessages } from './message.controllers.js';

const router = express.Router();

router.post("/", protect, validate(messageSchema), sendMessage);   //sending message
router.get("/:chatId", protect, getMessages);                    //getting messages
router.put("/edit/:id", protect, editMessage);                  //editing message
router.delete("/delete/:id", protect, deleteMessage);          //deleting message
router.post("/seen/:id", protect, markSeenController);          //marking message as seen

router.post("/star/:id", protect, starMessage);                  //starring message
router.post("/unstar/:id", protect, unstarMessage);              //unstarring message
router.get("/:chatId/starred", protect, getStarredMessages);      //getting all starred messages
router.post("/:id/forward", protect, forwardMessage);            //forwarding message
router.get("/:chatId/search", protect, searchMessages);          //searching messages

export default router;