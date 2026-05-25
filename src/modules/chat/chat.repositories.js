import Chat from '../../models/chat.model.js'

export const createChat=(data)=> Chat.create(data);

export const saveChat=(chat)=>chat.save();

export const findOneToOneChat=(userId1,userId2)=>{
    return Chat.findOne({
        isGroup:false,
        participants:{$all:[userId1,userId2],$size:2},
    })
};

export const getAllChats=(userId)=>{
    return Chat.find({participants:userId})
        .populate("participants","name email avatar isOnline")
        .populate("lastMessage")
        .sort({updatedAt:-1})
};

export const findChatById=(chatId)=>Chat.findById(chatId);