import mongoose from 'mongoose';

const messageSchema=new mongoose.Schema({
    chatId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"Chat",
        required:true,
    },
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User",
        required:true,
    },
    content:{
        type:String,
    },
    mediaUrl:{
        type:String,
    },
    status:{
        type:String,
        enum:["sent","delivered","seen"],
        default:"sent",
    },
    seenBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    deletedFor:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    replyTo:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
    },
    isEdited:{
        type:Boolean,
        default:false,
    },
    isDeleted:{
        type:Boolean,
        default:false,
    },

    deletedAt:{
        type:Date,
    },
    starredBy:[{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    }],
    forwardedFrom:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
    },
    forwardedFromChatId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Chat",
    },

},{timestamps:true});

messageSchema.index({ chatId: 1, createdAt: -1 });
messageSchema.index({ sender: 1 });
messageSchema.index({ content: "text" });
messageSchema.index({ starredBy: 1 });

export default mongoose.model("Message",messageSchema);