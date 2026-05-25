import mongoose from "mongoose";

const notificationSchema=new mongoose.Schema({
    userId:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
        index:true,
        required:true,
    },
    type:{
        type:String,
        enum:["MESSAGE","GROUP","CALL","MENTION"],
        required:true,
    },
    title:String,

    body:String,
    isRead:{
        type:Boolean,
        default:false,
        index:true,
    },
    data:{
        chatId: mongoose.Schema.Types.ObjectId,
        messageId: mongoose.Schema.Types.ObjectId,
    },
    

},{timestamps:true});


notificationSchema.index({userId:1,createdAt:-1});
notificationSchema.index({userId:1,isRead:1,createdAt:-1});



export default mongoose.model("Notification",notificationSchema);