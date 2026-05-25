import mongoose from 'mongoose';

const chatSchema=new mongoose.Schema({
    participants:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"User",
            required:true,
        }
    ],
    isGroup:{
        type:Boolean,
        default:false,
    },
    groupName:{
        type:String,
        default:"",
    },
    Admin:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"User",
    },
    lastMessage:{
        type:mongoose.Schema.Types.ObjectId,
        ref:"Message",
    
    },
    pinnedMessages:[
        {
            type:mongoose.Schema.Types.ObjectId,
            ref:"Message",
        }
    ],
    bio:{
        type:String,
        default:"",
    },
},{timestamps:true});

export default mongoose.model("Chat",chatSchema);