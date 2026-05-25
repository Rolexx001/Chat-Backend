import Notification from "../../models/notification.model.js";

export const createNotification=(data)=>{
    return Notification.create(data);
};

export const getUserNotifications=(userId,{limit=20,cursor}={})=>{
    let query={userId};
    if(cursor){
        query._id={$lt:cursor,};
    }
    return Notification.find(query).sort({_id:-1}).limit(limit).lean();
};

export const getUnreadNotification=(userId)=>{
    return Notification.find({userId,isRead:false}).sort({_id:-1}).lean();
};

export const countUnreadNotifications=(userId)=>{
    return Notification.countDocuments({userId,isRead:false});
};

export const markAsRead=(notificationId,userId)=>{
    return Notification.findOneAndUpdate({
         _id: notificationId, userId 
        }, 
        {$set:
            {isRead:true}
        },
        {new:true}
    ).lean();
};

export const markAllRead=(userId)=>{
    return Notification.updateMany({userId,isRead:false},{$set:{isRead:true}});
};

export const deleteNotification=(notificationId,userId)=>{
    return Notification.findOneAndDelete({ _id: notificationId, userId });
};

