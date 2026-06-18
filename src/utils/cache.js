import {redis} from '../config/redis.js';

export const getCache = async (key) => {
    try {
        const data = await redis.get(key);
        return data ? JSON.parse(data) : null;
    } catch (error) {
        console.error(`Redis GET Error for key ${key}:`, error);
        return null;
    }
};

export const setCache = async (key, data, ttl = 3600) => {
    try {
        await redis.set(key, JSON.stringify(data), 'EX', ttl);
    } catch (error) {
        console.error(`Redis SET Error for key ${key}:`, error);
    }
};

export const invalidateUsersChatsCache = async (userIds) => {
    if (!userIds || !Array.isArray(userIds)) return;
    const keys = userIds
        .filter(Boolean)
        .map((id) => {
            const rawId = id._id ? id._id.toString() : id.toString();
            return `chat.cache:${rawId}`;
        });
    if (keys.length) {
        await redis.del(keys);
    }
};

export const invalidateMessageCache = async (chatId) => {
    const pattern = `message.cache:${chatId}:*`;
    const keys = await redis.keys(pattern);
    if (keys.length) {
        await redis.del(keys);
    }
};

export const invalidateStarredCache = async (userId, chatId) => {
    const key = `starred:${userId}:${chatId}`;
    await redis.del(key);
};

export const cacheUserStarred = async (userId, chatId, messageIds) => {
    const key = `starred:${userId}:${chatId}`;
    if (messageIds.length) {
        await redis.sadd(key, ...messageIds);
        await redis.expire(key, 1800); // 30 min TTL
    }
};

export const getCacheKey = (prefix, ...args) => {
    return [prefix, ...args].join(':');
};
