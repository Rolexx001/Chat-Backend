import jwt from 'jsonwebtoken';
import { findbyId } from '../modules/auth/auth.repositories.js';
import Session from '../models/session.model.js';
import { redis } from '../config/redis.js';

export const protect = async (req, res, next) => {
    try {
        let token;
        if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
            token = req.headers.authorization.split(' ')[1];

        }
        if (!token) {
            return res.status(401).json({
                message: "No Token",
            });
        }
        const decoded = jwt.verify(token, process.env.ACCESS_TOKEN_SECRET);
        const user = await findbyId(decoded.userId);
        if (!user) {
            return res.status(401).json({
                message: "No User",
            });
        }

        // Verify active session
        if (decoded.sessionId) {
            const redisKey = `session:active:${decoded.sessionId}`;
            let sessionExists = await redis.get(redisKey);

            if (sessionExists === null) {
                const session = await Session.findById(decoded.sessionId);
                if (!session) {
                    return res.status(401).json({ message: "Session revoked" });
                }
                await redis.set(redisKey, "true", "EX", 900); // 15 mins cache
                sessionExists = "true";
            }

            if (sessionExists !== "true") {
                return res.status(401).json({ message: "Session revoked" });
            }
            req.sessionId = decoded.sessionId; //yaha added hai req m session id
        } else {
            return res.status(401).json({ message: "Invalid session" });
        }

        req.userId = user._id;
        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: "Invalid token" });

    }

};