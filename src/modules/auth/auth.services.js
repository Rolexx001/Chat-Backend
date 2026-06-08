import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import { generateAccessToken, generateRefreshToken } from '../../utils/generatetoken.js';
import { createUser, saveUser, findbyEmail, findbyId } from './auth.repositories.js';
import Session from '../../models/session.model.js';
import { redis } from '../../config/redis.js';
import { pub } from '../../config/redisPubSub.js';
import User from '../../models/user.model.js';
import Report from '../../models/report.model.js';


export const signupUser = async ({ name, email, password }) => {
    const existingUser = await findbyEmail(email);

    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = await createUser({
        name,
        email,
        password: hashedPassword,
    });
    return user;

};

export const loginUser = async ({ email, password, deviceInfo, ipAddress }) => {
    const user = await findbyEmail(email);

    if (!user) {
        throw new Error('Invalid credentials');
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
        throw new Error('Invalid credentials');
    }

    // Create session record
    const session = new Session({
        userId: user._id,
        refreshToken: 'temp',
        deviceInfo: deviceInfo || 'Unknown Device',
        ipAddress: ipAddress || ''
    });
    await session.save();

    const accessToken = generateAccessToken(user._id, session._id);
    const refreshToken = generateRefreshToken(user._id, session._id);

    session.refreshToken = refreshToken;
    await session.save();

    // Cache active session in Redis
    await redis.set(`session:active:${session._id}`, "true", "EX", 900);

    return { user, accessToken, refreshToken };
};

export const refreshAccessToken = async (oldRefreshToken) => {
    if (!oldRefreshToken) {
        throw new Error("No Refresh Token");
    }
    const decoded = jwt.verify(
        oldRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );

    const session = await Session.findOne({ _id: decoded.sessionId, refreshToken: oldRefreshToken });
    if (!session) {
        throw new Error("Invalid Refresh Token / Session Revoked");
    }

    const user = await findbyId(decoded.userId);
    if (!user) {
        throw new Error("User not found");
    }

    const newAccessToken = generateAccessToken(user._id, session._id);
    const newRefreshToken = generateRefreshToken(user._id, session._id);

    session.refreshToken = newRefreshToken;
    session.lastActive = new Date();
    await session.save();

    // Refresh active session cache in Redis
    await redis.set(`session:active:${session._id}`, "true", "EX", 900);

    return { newAccessToken, newRefreshToken };
};

export const logoutUser = async (sessionId) => {
    if (!sessionId) return true;

    await Session.findByIdAndDelete(sessionId);
    await redis.del(`session:active:${sessionId}`);

    // Publish session revocation event to disconnect websocket on all nodes
    await pub.publish("SESSION_REVOCATION", JSON.stringify({ sessionId }));

    return true;

};

export const updateProfileService = async (userId, { name, bio, avatar }) => {
    const user = await findbyId(userId);
    if (!user) {
        throw new Error("User not found");
    }

    if (name) user.name = name;
    if (bio) user.bio = bio;
    if (avatar) user.avatar = avatar;

    await saveUser(user);

    return user;
};



export const blockUserService = async (userId, targetUserId) => {
    if (userId.toString() === targetUserId.toString()) {
        throw new Error("You cannot block yourself");
    }

    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new Error("Target user not found");
    }

    await User.findByIdAndUpdate(userId, {
        $addToSet: { blockedUser: targetUserId }
    });

    return { success: true, message: "User blocked successfully" };
};

export const unblockUserService = async (userId, targetUserId) => {
    const targetUser = await User.findById(targetUserId);
    if (!targetUser) {
        throw new Error("Target user not found");
    }

    await User.findByIdAndUpdate(userId, {
        $pull: { blockedUser: targetUserId }
    });

    return { success: true, message: "User unblocked successfully" };
};

export const getBlockedUsersService = async (userId) => {
    const user = await User.findById(userId).populate("blockedUser", "name email avatar");
    if (!user) {
        throw new Error("User not found");
    }
    return user.blockedUser;
};

export const reportUserService = async (reporterId, reportedUserId, { reason, description, blockUser }) => {
    if (reporterId.toString() === reportedUserId.toString()) {
        throw new Error("You cannot report yourself");
    }

    const reportedUser = await User.findById(reportedUserId);
    if (!reportedUser) {
        throw new Error("Reported user not found");
    }

    const report = new Report({
        reporter: reporterId,
        reportedUser: reportedUserId,
        reason,
        description: description || ''
    });
    await report.save();

    if (blockUser) {
        await blockUserService(reporterId, reportedUserId);
    }

    return report;
};

export const getSessionsService = async (userId, currentSessionId) => {
    const sessions = await Session.find({ userId }).sort({ lastActive: -1 });

    return sessions.map(session => ({
        id: session._id,
        deviceInfo: session.deviceInfo,
        ipAddress: session.ipAddress,
        lastActive: session.lastActive,
        isCurrent: session._id.toString() === currentSessionId.toString()
    }));
};

export const revokeSessionService = async (userId, sessionId) => {
    const session = await Session.findOne({ _id: sessionId, userId });
    if (!session) {
        throw new Error("Session not found or unauthorized");
    }

    await Session.findByIdAndDelete(sessionId);
    await redis.del(`session:active:${sessionId}`);

    // Publish event to disconnect the socket associated with the session
    await pub.publish("SESSION_REVOCATION", JSON.stringify({ sessionId }));

    return { success: true, message: "Session revoked successfully" };
};

export const revokeAllSessionsExceptCurrentService = async (userId, currentSessionId) => {
    const sessions = await Session.find({ userId, _id: { $ne: currentSessionId } });

    for (const session of sessions) {
        await Session.findByIdAndDelete(session._id);
        await redis.del(`session:active:${session._id}`);
        await pub.publish("SESSION_REVOCATION", JSON.stringify({ sessionId: session._id }));
    }

    return { success: true, message: "All other sessions revoked successfully" };
};
