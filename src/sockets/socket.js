import {redis} from '../config/redis.js';

export let io;

export const initSocket=(serverIo)=>{
    io=serverIo;
    io.on("connection",(socket)=>{
        console.log("A user connected: ",socket.id);

        // Join user-specific room for re
        // al-time notification purposes
        socket.on("join",async(data)=>{
            try{
                const userId = typeof data === 'object' ? data.userId : data;
                const token = typeof data === 'object' ? data.token : null;

                socket.userId=userId;
                socket.join(userId);
                console.log(`User ${userId} joined their room`);

                if (token) {
                    const jwt = (await import('jsonwebtoken')).default;
                    try {
                        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
                        if (decoded.userId === userId) {
                            socket.sessionId=decoded.sessionId;
                            await redis.sadd(`SessionSockets:${decoded.sessionId}`, socket.id);
                            await redis.set(`SocketSession:${socket.id}`, decoded.sessionId);
                        }
                    } catch (e) {
                        console.error("Socket token verification failed:", e.message);
                    }
                }

                // Track multi-device online status
                const wasOffline = (await redis.scard(`OnlineSockets:${userId}`)) === 0;
                await redis.sadd(`OnlineSockets:${userId}`, socket.id);

                if (wasOffline) {
                    const User = (await import('../models/user.model.js')).default;
                    await User.findByIdAndUpdate(userId, { isOnline: true });

                    // Broadcast online presence to chats
                    const { fetchUserChats } = await import('../modules/chat/chat.services.js');
                    const chats = await fetchUserChats(userId);
                    const participantIds = new Set();
                    chats.forEach(chat => {
                        chat.participants.forEach(p => {
                            const pIdStr = typeof p === 'object' && p._id ? p._id.toString() : p.toString();
                            if (pIdStr !== userId.toString()) {
                                participantIds.add(pIdStr);
                            }
                        });
                    });

                    // Filter out blocked/blockers
                    const currentUser = await User.findById(userId).select('blockedUser');
                    const blockers = await User.find({ blockedUser: userId }).select('_id');
                    const blockedSet = new Set([
                        ...(currentUser?.blockedUser || []).map(id => id.toString()),
                        ...blockers.map(u => u._id.toString())
                    ]);

                    participantIds.forEach(pId => {
                        if (!blockedSet.has(pId)) {
                            io.to(pId).emit("UserPresence", { userId, isOnline: true });
                        }
                    });
                }
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
                    await redis.srem(`OnlineSockets:${socket.userId}`, socket.id);
                    const isStillOnline = (await redis.scard(`OnlineSockets:${socket.userId}`)) > 0;

                    if (socket.sessionId) {
                        await redis.srem(`SessionSockets:${socket.sessionId}`, socket.id);
                        await redis.del(`SocketSession:${socket.id}`);
                    }

                    console.log(`Socket ${socket.id} disconnected for user ${socket.userId}`);

                    if (!isStillOnline) {
                        const lastSeen = new Date();
                        const User = (await import('../models/user.model.js')).default;
                        await User.findByIdAndUpdate(socket.userId, { isOnline: false, lastSeen });

                        // Broadcast offline presence to chats
                        const { fetchUserChats } = await import('../modules/chat/chat.services.js');
                        const chats = await fetchUserChats(socket.userId);
                        const participantIds = new Set();
                        chats.forEach(chat => {
                            chat.participants.forEach(p => {
                                const pIdStr = typeof p === 'object' && p._id ? p._id.toString() : p.toString();
                                if (pIdStr !== socket.userId.toString()) {
                                    participantIds.add(pIdStr);
                                }
                            });
                        });

                        // Filter out blocked/blockers
                        const currentUser = await User.findById(socket.userId).select('blockedUser');
                        const blockers = await User.find({ blockedUser: socket.userId }).select('_id');
                        const blockedSet = new Set([
                            ...(currentUser?.blockedUser || []).map(id => id.toString()),
                            ...blockers.map(u => u._id.toString())
                        ]);

                        participantIds.forEach(pId => {
                            if (!blockedSet.has(pId)) {
                                io.to(pId).emit("UserPresence", { userId: socket.userId, isOnline: false, lastSeen });
                            }
                        });
                    }
                }

            } catch (error) {
                console.error("Disconnect socket error:", error);
            }

        });
    
    });
};