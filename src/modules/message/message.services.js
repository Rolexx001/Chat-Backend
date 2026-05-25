import {
  createMessage,
  getMessagesByChat,
  updateLastMessage,
  saveMessage,
  markSeen,
  findMessageById,
  starMessage,
  unstarMessage,
  getStarredMessages,
} from "./message.repositories.js";
import { invalidateUsersChatsCache, invalidateStarredCache } from "../../utils/cache.js";
import Chat from "../../models/chat.model.js";
import { sendNotification } from "../notification/notification.services.js";
import { redis } from "../../config/redis.js";


// send message service
export const sendMessageService = async (
  userId,
  { chatId, content, mediaUrl, replyTo },
) => {
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  const isParticipant = chat.participants.some(
    (participant) => participant.toString() === userId.toString(),
  );
  if (!isParticipant) {
    throw new Error("You are not authorized to send message in this chat");
  }
  if (replyTo) {
    const repliedMessage = await findMessageById(replyTo);
    if (!repliedMessage) {
      throw new Error("Replied message not found");
    }
    if (repliedMessage.chatId.toString() !== chatId.toString()) {
      throw new Error("You can only reply to messages in the same chat");
    }
    if (repliedMessage.isDeleted) {
      throw new Error(
        "Cannot reply to deleted message"
      );
    }
  }
  const message = await createMessage({
    chatId,
    sender: userId,
    content,
    mediaUrl,
    replyTo,
  });
  await updateLastMessage(chatId, message._id);
  await invalidateUsersChatsCache(chat.participants);
  await Promise.all(
    chat.participants
      .filter((participant) => participant.toString() !== userId.toString())
      .map((participant) =>
        sendNotification({
          userId: participant,
          type: "MESSAGE",
          title: "New Message",
          body: message.content,
          data: {
            chatId,
            messageId: message._id,
          },
        }),
      ),
  );

  return message;
};

// take chatId and return all messages of that chat
export const fetchMessageService = async (userId, chatId, cursor, limit) => {
  limit = Math.min(Number(limit) || 20, 50);
  const chat = await Chat.findById(chatId);
  if (!chat) {
    throw new Error("Chat not found");
  }
  const isParticipant = chat.participants.some(
    (participant) => participant.toString() === userId.toString(),
  );
  if (!isParticipant) {
    throw new Error("You are not authorized to access this chat");
  }
  const clearedAt = await redis.get(`clearchat:${userId}:${chatId}`);
  return await getMessagesByChat(chatId, userId, clearedAt, cursor, limit);
};

// mark message as seen
export const markMessageSeenService = async (messageId, userId) => {
  await invalidateUsersChatsCache([userId]);
  return await markSeen(messageId, userId);
};

// edit message service
export const editMessageService = async (messageId, userId, content) => {
  const message = await findMessageById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  if (message.sender.toString() !== userId.toString()) {
    throw new Error("You are not authorized to edit this message");
  }
  if (message.isDeleted) {
    throw new Error("You cannot edit a deleted message");
  }

  message.content = content;
  message.isEdited = true;
  const chat = await Chat.findById(message.chatId);
  await invalidateUsersChatsCache(chat.participants);
  return await saveMessage(message);
};

export const deleteMessageService = async (messageId, userId, type) => {
  const message = await findMessageById(messageId);
  if (!message) {
    throw new Error("Message not found");
  }
  const DELETED_TEXT = "This message was deleted";
  if (type === "everyone") {
    if (message.sender.toString() !== userId.toString()) {
      throw new Error("Only sender can delete for everyone");
    }
    if (message.content === DELETED_TEXT) {
      throw new Error("Message is already deleted for everyone");
    }
    message.content = DELETED_TEXT;
    message.mediaUrl = null;
    message.isDeleted = true;
    message.deletedAt = new Date();
  } else {
    const alreadyDeleted = message.deletedFor.some(
      (id) => id.toString() === userId.toString(),
    );

    if (!alreadyDeleted) {
      message.deletedFor.push(userId);
    }
  }
  const chat = await Chat.findById(message.chatId);
  await invalidateUsersChatsCache(chat.participants);

  return await saveMessage(message);
};

export const starMessageService = async (userId, messageId) => {
  const message = await findMessageById(messageId);
  if (!message) throw new Error("Message not found");

  const chat = await Chat.findById(message.chatId);
  if (!chat) throw new Error("Chat not found");

  const isParticipant = chat.participants.some(id => id.toString() === userId.toString());
  if (!isParticipant) throw new Error("Not authorized");

  const updatedMessage = await starMessage(messageId, userId);
  await invalidateStarredCache(userId, message.chatId);
  return updatedMessage;
};

export const unstarMessageService = async (userId, messageId) => {
  const message = await findMessageById(messageId);
  if (!message) throw new Error("Message not found");

  const chat = await Chat.findById(message.chatId);
  if (!chat) throw new Error("Chat not found");

  const isParticipant = chat.participants.some(id => id.toString() === userId.toString());
  if (!isParticipant) throw new Error("Not authorized");

  const updatedMessage = await unstarMessage(messageId, userId);
  await invalidateStarredCache(userId, message.chatId);
  return updatedMessage;
};

export const fetchStarredMessagesService = async (userId, chatId) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  const isParticipant = chat.participants.some(id => id.toString() === userId.toString());
  if (!isParticipant) throw new Error("Not authorized");

  return await getStarredMessages(userId, chatId);
};

export const forwardMessageService = async (userId, messageId, targetChatIds) => {
  const originalMessage = await findMessageById(messageId);
  if (!originalMessage) throw new Error("Original message not found");

  const originChat = await Chat.findById(originalMessage.chatId);
  if (!originChat) throw new Error("Origin chat not found");

  const isOriginParticipant = originChat.participants.some(id => id.toString() === userId.toString());
  if (!isOriginParticipant) throw new Error("Not authorized in origin chat");

  const chatsToForward = Array.isArray(targetChatIds) ? targetChatIds : [targetChatIds];
  const forwardedMessages = [];

  for (const targetChatId of chatsToForward) {
    const targetChat = await Chat.findById(targetChatId);
    if (!targetChat) continue;

    const isTargetParticipant = targetChat.participants.some(id => id.toString() === userId.toString());
    if (!isTargetParticipant) continue;

    const forwardedMsg = await createMessage({
      chatId: targetChatId,
      sender: userId,
      content: originalMessage.content,
      mediaUrl: originalMessage.mediaUrl,
      forwardedFrom: originalMessage._id,
      forwardedFromChatId: originalMessage.chatId,
    });

    await updateLastMessage(targetChatId, forwardedMsg._id);
    await invalidateUsersChatsCache(targetChat.participants);

    // Notify other participants in the target chat
    await Promise.all(
      targetChat.participants
        .filter((p) => p.toString() !== userId.toString())
        .map((p) =>
          sendNotification({
            userId: p,
            type: "MESSAGE",
            title: "Forwarded Message",
            body: forwardedMsg.content || "Media message",
            data: {
              chatId: targetChatId,
              messageId: forwardedMsg._id,
            },
          })
        )
    );

    forwardedMessages.push(forwardedMsg);
  }

  return forwardedMessages;
};

export const searchMessagesService = async (userId, chatId, searchQuery) => {
  const chat = await Chat.findById(chatId);
  if (!chat) throw new Error("Chat not found");

  const isParticipant = chat.participants.some(id => id.toString() === userId.toString());
  if (!isParticipant) throw new Error("Not authorized");

  if (!searchQuery) return [];

  const query = {
    chatId,
    content: { $regex: searchQuery, $options: "i" },
    deletedFor: { $ne: userId },
    isDeleted: false,
  };

  const clearedAt = await redis.get(`clearchat:${userId}:${chatId}`);
  if (clearedAt) {
    query.createdAt = { $gt: new Date(clearedAt) };
  }

  const messages = await Message.find(query).populate("sender", "name email avatar");
  return messages;
};
