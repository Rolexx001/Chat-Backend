import rateLimit from "express-rate-limit";
import RedisStore from "rate-limit-redis";
import { redis } from "../config/redis.js";

const skipRateLimit = process.env.DISABLE_RATE_LIMIT === 'true';

export const apiLimiter = skipRateLimit 
    ? (req, res, next) => next() 
    : rateLimit({
        store: new RedisStore({
            sendCommand: (...args) => redis.call(...args),
        }),
        windowMs:15*60*1000,
        max:100,
        message:"Too many requests from this IP, please try again after 15 minutes",
    });