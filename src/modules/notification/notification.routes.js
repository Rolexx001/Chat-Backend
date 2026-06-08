import express from "express";
import { protect } from "../../middleware/auth.middleware.js";
import {
    getNotifications,
    getUnreadNotifications,
    countUnreadNotifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    deleteNotification,
} from "./notification.controllers.js";

const router = express.Router();

router.get("/", protect, getNotifications);  //getting all notifications of a user
router.get("/unread", protect, getUnreadNotifications);  //getting unread notifications of a user
router.get("/unread/count", protect, countUnreadNotifications);  //counting unread notifications of a user
router.patch("/:id/read", protect, markNotificationAsRead);  //marking a notification as read
router.patch("/read-all", protect, markAllNotificationsAsRead);  //marking all notifications as read
router.delete("/:id", protect, deleteNotification);  //deleting a notification

export default router;
