import { Worker } from "bullmq";
import { redis } from "../config/redis.js";
import fs from "fs/promises";
import path from "path";
import sharp from "sharp";
import User from "../models/user.model.js";
import Message from "../models/message.model.js";
import Status from "../models/status.model.js";
import { io } from "../sockets/socket.js";
import { invalidateUsersChatsCache } from "../utils/cache.js";
import Chat from "../models/chat.model.js";

const UPLOAD_DIR = 'uploads';

new Worker(
    "media-processing",
    async (job) => {
        const { tempPath, userId, type, resourceId } = job.data;
        const fullTempPath = path.join('.', tempPath);

        try {
            // Check if temp file exists
            await fs.access(fullTempPath);
            
            // Read file
            const fileBuffer = await fs.readFile(fullTempPath);

            // Run optimization
            const timestamp = Date.now();
            const filename = `${timestamp}-${Math.random().toString(36).slice(2)}.webp`;
            const finalFilepath = path.join(UPLOAD_DIR, filename);

            // Process with sharp to WebP
            await sharp(fileBuffer)
                .resize(1920, 1080, { fit: 'inside', withoutEnlargement: true })
                .webp({ quality: 80 })
                .toFile(finalFilepath);

            const finalUrl = `/${finalFilepath}`;

            // Update the appropriate model
            if (type === "avatar") {
                await User.findByIdAndUpdate(userId, { avatar: finalUrl });
                
                // Emit socket update
                io.to(userId.toString()).emit("AvatarProcessed", { avatarUrl: finalUrl });
            } 
            else if (type === "message") {
                const message = await Message.findByIdAndUpdate(resourceId, {
                    mediaUrl: finalUrl
                }, { new: true });
                
                if (message) {
                    // Invalidate chat cache
                    const chat = await Chat.findById(message.chatId);
                    if (chat) {
                        await invalidateUsersChatsCache(chat.participants);
                    }
                    
                    // Notify participants via Socket.io
                    io.to(message.chatId.toString()).emit("MessageMediaProcessed", {
                        messageId: resourceId,
                        mediaUrl: finalUrl
                    });
                }
            } 
            else if (type === "status") {
                const status = await Status.findByIdAndUpdate(resourceId, {
                    mediaUrl: finalUrl
                }, { new: true });
                
                if (status) {
                    io.to(userId.toString()).emit("StatusMediaProcessed", {
                        statusId: resourceId,
                        mediaUrl: finalUrl
                    });
                }
            }

            // Delete temp file
            await fs.unlink(fullTempPath).catch(err => console.error("Failed to delete temp file:", err));
            console.log(`Successfully processed media for user ${userId}, type: ${type}`);

        } catch (err) {
            console.error("Error in media background worker:", err);
            throw err;
        }
    },
    { connection: redis }
);
