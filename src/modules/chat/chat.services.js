import { createChat, saveChat, findChatById, findOneToOneChat, getAllChats } from "./chat.repositories.js";
import { redis } from '../../config/redis.js';
import { invalidateUsersChatsCache } from "../../utils/cache.js";
import Message from "../../models/message.model.js";
import Chat from "../../models/chat.model.js";

export const createOneToOneChat = async (userId, targetUserId) => {
    let chat = await findOneToOneChat(userId, targetUserId);
    if (chat) return chat;

    chat = await createChat({
        isGroup: false,
        participants: [userId, targetUserId],
    });
    await invalidateUsersChatsCache([userId, targetUserId]);// like aman ki chat m db m x,y,z(new) but cache m sirf x,y honge to cache invalidate krna hoga dono ka taki next time jab fetch kre to naya data mile
    return chat;
};

export const createGroupChat = async (userId, groupName, participants) => {
    let chat = await createChat({
        isGroup: true,
        groupName,
        participants: [userId, ...participants],
        Admin: userId,
    });
    await invalidateUsersChatsCache([userId, ...participants]);
    return chat;
};

export const fetchUserChats = async (userId) => {
    const cacheKey = `chat.cache:${userId}`;
    const cachedChats = await redis.get(cacheKey);
    if (cachedChats) {
        return JSON.parse(cachedChats);
    }
    const chats = await getAllChats(userId);
    await redis.set(cacheKey, JSON.stringify(chats), "EX", 3600);
    return chats;

};

export const addMember = async (chatId, userId, newUserId) => {
    const chat = await findChatById(chatId);

    if (!chat.isGroup) throw new Error("Not a Group");

    if (chat.Admin.toString() !== userId) throw new Error("Only Admins can add Members");

    chat.participants.push(newUserId);
    await invalidateUsersChatsCache(chat.participants);

    return await saveChat(chat);



};
export const removeMember = async (chatId, userId, removeUserId) => {
    const chat = await findChatById(chatId);

    if (!chat.isGroup) throw new Error("Not a Group");

    if (chat.Admin.toString() !== userId) throw new Error("Only Admins can add Members");

    chat.participants = chat.participants.filter(
        (id) => id.toString() !== removeUserId
    );
    await invalidateUsersChatsCache(chat.participants);

    return await saveChat(chat);
};

export const pinMessageService = async (chatId, messageId, userId) => {
    const chat = await findChatById(chatId);
    if (!chat) throw new Error("Chat not found");

    const isParticipant = chat.participants.some(id => id.toString() === userId.toString());
    if (!isParticipant) throw new Error("Not authorized to pin message");

    if (!chat.pinnedMessages.includes(messageId)) {
        chat.pinnedMessages.push(messageId);
        await saveChat(chat);
        await invalidateUsersChatsCache(chat.participants);
    }
    return chat;
};

export const unpinMessageService = async (chatId, messageId, userId) => {
    const chat = await findChatById(chatId);
    if (!chat) throw new Error("Chat not found");

    const isParticipant = chat.participants.some(id => id.toString() === userId.toString());
    if (!isParticipant) throw new Error("Not authorized");

    chat.pinnedMessages = chat.pinnedMessages.filter(id => id.toString() !== messageId.toString());
    await saveChat(chat);
    await invalidateUsersChatsCache(chat.participants);
    return chat;
};

export const getPinnedMessagesService = async (chatId, userId) => {
    const chat = await Chat.findById(chatId).populate({
        path: "pinnedMessages",
        populate: { path: "sender", select: "name email avatar" }
    });
    if (!chat) throw new Error("Chat not found");

    const isParticipant = chat.participants.some(id => id.toString() === userId.toString());
    if (!isParticipant) throw new Error("Not authorized");

    return chat;
};

export const clearChatService = async (chatId, userId) => {
    const chat = await findChatById(chatId);
    if (!chat) throw new Error("Chat not found");

    const isParticipant = chat.participants.some(id => id.toString() === userId.toString());
    if (!isParticipant) throw new Error("Not authorized");

    // Add userId to deletedFor for all messages in this chat
    await Message.updateMany(
        { chatId },
        { $addToSet: { deletedFor: userId } }
    );

    // Set cleared at timestamp in Redis
    const clearedAt = new Date().toISOString();
    await redis.set(`clearchat:${userId}:${chatId}`, clearedAt);
    await invalidateUsersChatsCache([userId]);

    return { clearedAt };
};

export const getClearChatTimestampService = async (chatId, userId) => {
    const clearedAt = await redis.get(`clearchat:${userId}:${chatId}`);
    return clearedAt || null;
};