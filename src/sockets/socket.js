import {redis} from '../config/redis.js';

export let io;

export const initSocket=(serverIo)=>{
    io=serverIo;
    io.on("connection",(socket)=>{
        console.log("A user connected: ",socket.id);

        // Join user-specific room for re
        // al-time notification purposes
        socket.on("join",async(userId)=>{
            try{
                socket.userId=userId;
                socket.join(userId);
                console.log(`User ${userId} joined their room`);
                await redis.set(`Online:${userId}`,"true");
            }
            catch(err){
                console.error("Error joining socket room: ",err);
            }
        });

        // Join chat room for real-time messaging
        socket.on("joinChat",(chatId)=>{
            try{
                socket.join(chatId);
                console.log(`User joined chat ${chatId}`);
            } catch(err){
                console.error("join chat socket error: ",err);
            }
        });
        
        socket.on("leaveChat",(chatId)=>{
            try{
                socket.leave(chatId);
                console.log(`User left chat ${chatId}`);
            } catch(err){
                console.error("leave chat socket error: ",err);
            }
        });
        // Handle sending messages
        socket.on("sendMessage",(message)=>{
            try{
                // Emit the message to other participants in the chat room
                socket.to(message.chatId).emit("ReceiveMessage",message);
            } catch(err){
                console.error("send message socket error: ",err);
            }
        });

        // Handle typing events
        socket.on("typing",({chatId})=>{
             try {
                socket.to(chatId).emit("Typing", {
                    userId: socket.userId,
                });

                if (!socket.typingTimeouts) {
                    socket.typingTimeouts = {};
                }

                if (socket.typingTimeouts[chatId]) {
                    clearTimeout(socket.typingTimeouts[chatId]);
                }

                socket.typingTimeouts[chatId] = setTimeout(() => {
                    try {
                        socket.to(chatId).emit("StopTyping", { userId: socket.userId });
                        delete socket.typingTimeouts[chatId];
                    } catch (err) {
                        console.error("Auto stop typing error:", err);
                    }
                }, 3000); // 3-second auto stop typing fallback

            } catch (error) {
                console.error("Typing socket error:", error);
            }
        });
        
        socket.on("stopTyping",({chatId})=>{
            try{
                socket.to(chatId).emit("StopTyping",{userId:socket.userId});
                if (socket.typingTimeouts && socket.typingTimeouts[chatId]) {
                    clearTimeout(socket.typingTimeouts[chatId]);
                    delete socket.typingTimeouts[chatId];
                }
            } catch (error) {
                console.error("Stop typing socket error:", error);
            }
        });

        socket.on("editMessage",(data)=>{
            try{
                socket.to(data.chatId).emit("MessageEdited",data);
            } catch (error) {
                console.error("Edit message socket error:", error);
            }
        });

        socket.on("deleteMessage",(data)=>{
            try{
                socket.to(data.chatId).emit("MessageDeleted",data);
            } catch (error) {
                console.error("Delete message socket error:", error);
            }
        });

        socket.on("markSeen",({chatId,messageId,userId})=>{
            try{
                socket.to(chatId).emit("MessageSeen",{messageId,userId});
            } catch (error) {
                console.error("Mark seen socket error:", error);
            }
        });
        
        socket.on("disconnect",async()=>{
            try {
                if (socket.typingTimeouts) {
                    Object.values(socket.typingTimeouts).forEach(clearTimeout);
                }
                if (socket.userId) {
                    await redis.set(`Online:${socket.userId}`, "false");

                    console.log(`User ${socket.userId} disconnected`);
                }

            } catch (error) {
                console.error("Disconnect socket error:", error);
            }

        });
    
    });
};