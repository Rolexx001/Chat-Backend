import {sub} from "../config/redisPubSub.js";
import {io} from "../sockets/socket.js";

const CHANNEL="NOTIFICATION";

export const initNotificationSubscriber=async()=>{
    //Subscribe to notification channel
    await sub.subscribe(CHANNEL);
    //Listen for messages on the channel incoming from publisher
    sub.on("message",async(channel,message)=>{
        //ignore messages from other channels
        if(channel!==CHANNEL) return;
        //convert string message to object
        const notification=JSON.parse(message);
        //Emit notification to the specific user room using socket.io
        io.to(notification.userId.toString()).emit("ReceiveNotification",notification);
    });
};