import {Worker} from "bullmq";
import {redis} from "../config/redis.js";

new Worker(
    "notifications",
    async(job)=>{
        //Notification data from the queue
        const notification=job.data;
        //check user online status
        const isOnline=(await redis.scard(`OnlineSockets:${notification.userId}`)) > 0;

        //if user is online, we can skip sending email or push notification as they will receive real-time notification via socket.io
        //if user is offline, we can send email or push notification
        if(!isOnline){
            console.log("Send Push Notification");
        }
    },
    {connection:redis}
);