import {z} from "zod";

export const messageSchema=z.object({
    chatId:z.string(),
    content:z.string().optional(),
    mediaUrl:z.string().optional(),
    replyTo:z.string().optional(),
}).refine((data)=>data.content||data.mediaUrl,{
    message:"Either content or mediaUrl is required"
});

