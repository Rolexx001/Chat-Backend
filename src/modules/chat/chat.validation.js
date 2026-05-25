import {z} from 'zod';

export const chatSchema=z.object({
    userId:z.string(),
});

export const groupSchema=z.object({
    groupName:z.string().min(2),
    participants:z.array(z.string()).refine(
        (arr)=>new Set(arr).size===arr.length,
        {message:"Duplicate participants not Allowed"}
    ),
});