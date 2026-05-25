import chat from "../../models/chat.model.js";
import Message from "../../models/message.model.js";

export const createMessage=(data)=>{
    return Message.create(data);
};

export const getMessagesByChat = async (
    chatId,
    userId,
    clearedAt,
    cursor,
    limit = 20
) => {

    const query = { chatId };

    if (userId) {
        query.deletedFor = { $ne: userId };
    }

    if (clearedAt) {
        query.createdAt = { $gt: new Date(clearedAt) };
    }

    // fetch older messages
    if (cursor) {
        query._id = { $lt: cursor };
    }

    const messages = await Message.find(query)
        .sort({ _id: -1 })
        .limit(limit + 1)
        .populate("sender", "name email avatar");

    const hasMore = messages.length > limit;

    if (hasMore) {
        messages.pop();
    }

    return {
        messages: messages.reverse(),
        nextCursor: hasMore ? messages[0]?._id || null : null,
        hasMore
    };
};

export const updateLastMessage=(chatId,messadeId)=>{
    return chat.findByIdAndUpdate(chatId,{lastMessage:messadeId});
};

export const findMessageById=(id)=>{
    return Message.findById(id);
};

export const saveMessage=(messagee)=>{
    return messagee.save();
};

export const markSeen=async(messageId,userId)=>{
    return await Message.findByIdAndUpdate(
        messageId,
        {
            $addToSet:{seenBy:userId},
            

        },
        {new:true}
    ).lean();
};

export const starMessage=(messageId,userId)=>{
    return Message.findByIdAndUpdate(
        messageId,
        { $addToSet: { starredBy: userId } },
        { new: true }
    ).populate("sender", "name email avatar");
};

export const unstarMessage=(messageId,userId)=>{
    return Message.findByIdAndUpdate(
        messageId,
        { $pull: { starredBy: userId } },
        { new: true }
    ).populate("sender", "name email avatar");
};

export const getStarredMessages=(userId,chatId)=>{
    return Message.find({ chatId, starredBy: userId }).populate("sender", "name email avatar");
};