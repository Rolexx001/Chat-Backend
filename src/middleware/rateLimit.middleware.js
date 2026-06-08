import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis.js";

export const apiLimiter=rateLimit({
    store: new RedisStore({
        sendCommand: (...args) => redis.call(...args),
    }),
    windowMs:15*60*1000,
    max:100,
    message:"Too many requests from this IP, please try again after 15 minutes",
});