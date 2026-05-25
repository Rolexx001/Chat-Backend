import { createOneToOneChat,createGroupChat,fetchUserChats,addMember,removeMember,pinMessageService,unpinMessageService,getPinnedMessagesService,clearChatService,getClearChatTimestampService } from "./chat.services.js";

export const createChat=async(req,res,next)=>{
    try{
        const chat=await createOneToOneChat(
            req.userId,
            req.body.userId,
        );
        res.json({
            success:true,
            chat,
        })
    } catch(error){
        next(error);
    }
};

export const createGroup= async(req,res,next)=>{
    try{
        const chat=await createGroupChat(
            req.userId,
            req.body.groupName,
            req.body.participants,
        );
        res.json({
            success:true,
            chat,
        })
    } catch(error){
        next(error);
    }
};

export const fetchChats=async(req,res,next)=>{
    try{
        const chats=await fetchUserChats(req.userId);
        res.json({
            success:true,
            chats,
        })
    } catch(error){
        next(error);
    }
};

export const addUser=async(req,res,next)=>{
    try{
        const chat=await addMember(
            req.params.chatId,
            req.userId,
            req.body.userId,
        );
        res.json({
            success:true,
            chat,
        })
    } catch(error){
        next(error);
    }
}

export const removeUser=async(req,res,next)=>{
    try{
        const chat=await removeMember(
            req.params.chatId,
            req.userId,
            req.body.userId,
        );
        res.json({
            success:true,
            chat,
        })
    } catch(error){
        next(error);
    }
}
export const pinMessage = async (req, res, next) => {
    try {
        const chat = await pinMessageService(
            req.params.chatId,
            req.body.messageId,
            req.userId
        );
        res.json({ success: true, chat });
    } catch (error) {
        next(error);
    }
};

export const unpinMessage = async (req, res, next) => {
    try {
        const chat = await unpinMessageService(
            req.params.chatId,
            req.body.messageId,
            req.userId
        );
        res.json({ success: true, chat });
    } catch (error) {
        next(error);
    }
};

export const getPinnedMessages = async (req, res, next) => {
    try {
        const chat = await getPinnedMessagesService(
            req.params.chatId,
            req.userId
        );
        res.json({ success: true, pinnedMessages: chat.pinnedMessages });
    } catch (error) {
        next(error);
    }
};

export const clearChat = async (req, res, next) => {
    try {
        const result = await clearChatService(
            req.params.chatId,
            req.userId
        );
        res.json({ success: true, ...result });
    } catch (error) {
        next(error);
    }
};

export const getClearTimestamp = async (req, res, next) => {
    try {
        const timestamp = await getClearChatTimestampService(
            req.params.chatId,
            req.userId
        );
        res.json({ success: true, clearedAt: timestamp });
    } catch (error) {
        next(error);
    }
};
