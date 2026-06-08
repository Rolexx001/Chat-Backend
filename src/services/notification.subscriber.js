import {sub} from "../config/redisPubSub.js";
import {io} from "../sockets/socket.js";
import { redis } from "../config/redis.js";

const CHANNEL="NOTIFICATION";
const SESSION_CHANNEL="SESSION_REVOCATION";

export const initNotificationSubscriber=async()=>{
    //Subscribe to notification & session channels
    await sub.subscribe(CHANNEL, SESSION_CHANNEL);
    //Listen for messages on the channels
    sub.on("message",async(channel,message)=>{
        if(channel === CHANNEL) {
            //convert string message to object
            const notification=JSON.parse(message);
            //Emit notification to the specific user room using socket.io
            io.to(notification.userId.toString()).emit("ReceiveNotification",notification);
        } else if(channel === SESSION_CHANNEL) {
            const { sessionId } = JSON.parse(message);
            const socketIds = await redis.smembers(`SessionSockets:${sessionId}`);
            for (const socketId of socketIds) {
                const socketObj = io.sockets?.sockets?.get(socketId);
                if (socketObj) {
                    socketObj.emit("SessionRevoked", { message: "Your session has been revoked." });
                    socketObj.disconnect(true);
                }
            }
        }
    });
};