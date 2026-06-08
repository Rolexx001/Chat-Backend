import {
  createNotification,
  getUserNotifications,
  getUnreadNotification,
  countUnreadNotifications,
  markAsRead,
  markAllRead,
  deleteNotification,
} from "./notification.repositories.js";
import {pub} from "../../config/redisPubSub.js";
import {notificationQueue} from "../../jobs/notification.queue.js";

const CHANNEL="NOTIFICATION";

//Send notification
export const sendNotification=async(payload)=>{
  //save notification to db
  const notification=await createNotification(payload);
  //publish notification to realTime
  await pub.publish(CHANNEL,JSON.stringify(notification));
  //add notification to queue for further processing like sending email
  await notificationQueue.add("push-notification",notification, {
      attempts: 3,
      backoff: {
          type: "exponential",
          delay: 1000
      }
  });
  return notification;

};

//Get user notifications
export const getNotification=async(userId,query)=>{
  return getUserNotifications(userId,query);
};

//Get unread notifications
export const getUnread=async(userId)=>{
  return getUnreadNotification(userId);
};

//Count unread notifications
export const countUnread=async(userId)=>{
  return countUnreadNotifications(userId);
};

//Mark One notification as read
export const markRead=async(notificationId,userId)=>{
  return markAsRead(notificationId,userId);
};

//Mark all notifications as read
export const markAllAsRead=async(userId)=>{
  return markAllRead(userId);
};

//Delete notification
export const removeNotification=async(notificationId,userId)=>{
  return deleteNotification(notificationId,userId);
};
