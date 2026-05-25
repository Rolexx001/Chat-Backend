import {
    sendNotification,
    getNotification,
    getUnread,
    countUnread,
    markRead,
    markAllAsRead,
    removeNotification,

} from "./notification.services.js";

//Get notifications
export const getNotifications=async(req,res)=>{
    const data=await getNotification(req.userId,{
        limit:Number(req.query.limit)||20,
        cursor:req.query.cursor,
    });
    return res.status(200).json({
        success:true,
        data,
    });
};

//Get unread notifications
export const getUnreadNotifications=async(req,res)=>{
    const data=await getUnread(req.userId);
    return res.status(200).json({
        success:true,
        data,
    });
};

//Count unread notifications
export const countUnreadNotifications=async(req,res)=>{
    const count=await countUnread(req.userId);
    return res.status(200).json({
        success:true,
        count,
    });
};

//Mark as read
export const markNotificationAsRead=async(req,res)=>{
    const data=await markRead(req.params.id,req.userId);
    return res.status(200).json({
        success:true,
        data,
    });
};

//Mark all as read
export const markAllNotificationsAsRead=async(req,res)=>{
    await markAllAsRead(req.userId);
    return res.status(200).json({
        success:true,
        message:"All notifications marked as read", 
    });
};

//Delete notification
export const deleteNotification=async(req,res)=>{
    await removeNotification(req.params.id,req.userId);
    return res.status(200).json({
        success:true,
        message:"Notification deleted",
    });
};
