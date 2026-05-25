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

router.get("/", protect, getNotifications);
router.get("/unread", protect, getUnreadNotifications);
router.get("/unread/count", protect, countUnreadNotifications);
router.patch("/:id/read", protect, markNotificationAsRead);
router.patch("/read-all", protect, markAllNotificationsAsRead);
router.delete("/:id", protect, deleteNotification);

export default router;
