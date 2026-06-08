import {
    loginUser,
    signupUser,
    refreshAccessToken,
    logoutUser,
    updateProfileService,
    blockUserService,
    unblockUserService,
    getBlockedUsersService,
    reportUserService,
    getSessionsService,
    revokeSessionService,
    revokeAllSessionsExceptCurrentService
} from './auth.services.js';

export const signup = async (req, res, next) => {
    try {
        const user = await signupUser(req.body);
        res.status(201).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }

};

export const login = async (req, res, next) => {
    try {
        const deviceInfo = req.headers['user-agent'] || 'Unknown Device';
        const ipAddress = req.ip || req.headers['x-forwarded-for'] || '';
        const { user, accessToken, refreshToken } = await loginUser({ ...req.body, deviceInfo, ipAddress });
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });
        res.status(200).json({
            success: true,
            user,
            accessToken,

        })
    } catch (error) {
        next(error);
    }

};

export const refreshTokenController = async (req, res, next) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        const { newAccessToken, newRefreshToken } = await refreshAccessToken(refreshToken);
        res.cookie('refreshToken', newRefreshToken, {
            httpOnly: true,
            sameSite: "strict",
            secure: false,
        });
        res.status(200).json({
            success: true,
            accessToken: newAccessToken,
        })

    } catch (error) {
        next(error);
    }
};

export const logout = async (req, res, next) => {
    try {
        await logoutUser(req.sessionId);
        res.clearCookie('refreshToken');
        res.status(200).json({
            success: true,
            message: "Logged out successfully",
        });

    } catch (error) {
        next(error);
    }
};

export const getProfile = async (req, res, next) => {
    try {
        res.status(200).json({
            success: true,
            user: req.user,
        });
    } catch (error) {
        next(error);
    }
};

export const updateProfile = async (req, res, next) => {
    try {
        const user = await updateProfileService(req.userId, req.body);
        res.status(200).json({
            success: true,
            user,
        });
    } catch (error) {
        next(error);
    }
};

export const blockUser = async (req, res, next) => {
    try {
        const { targetUserId } = req.body;
        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "targetUserId is required" });
        }
        const result = await blockUserService(req.userId, targetUserId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const unblockUser = async (req, res, next) => {
    try {
        const { targetUserId } = req.body;
        if (!targetUserId) {
            return res.status(400).json({ success: false, message: "targetUserId is required" });
        }
        const result = await unblockUserService(req.userId, targetUserId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const getBlockedUsers = async (req, res, next) => {
    try {
        const blockedUsers = await getBlockedUsersService(req.userId);
        res.status(200).json({ success: true, blockedUsers });
    } catch (error) {
        next(error);
    }
};

export const reportUser = async (req, res, next) => {
    try {
        const { reportedUserId, reason, description, blockUser } = req.body;
        if (!reportedUserId || !reason) {
            return res.status(400).json({ success: false, message: "reportedUserId and reason are required" });
        }
        const report = await reportUserService(req.userId, reportedUserId, { reason, description, blockUser });
        res.status(201).json({ success: true, report });
    } catch (error) {
        next(error);
    }
};

export const getSessions = async (req, res, next) => {
    try {
        const sessions = await getSessionsService(req.userId, req.sessionId);
        res.status(200).json({ success: true, sessions });
    } catch (error) {
        next(error);
    }
};

export const revokeSession = async (req, res, next) => {
    try {
        const { sessionId } = req.params;
        if (!sessionId) {
            return res.status(400).json({ success: false, message: "sessionId is required" });
        }
        const result = await revokeSessionService(req.userId, sessionId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};

export const revokeAllSessionsExceptCurrent = async (req, res, next) => {
    try {
        const result = await revokeAllSessionsExceptCurrentService(req.userId, req.sessionId);
        res.status(200).json(result);
    } catch (error) {
        next(error);
    }
};
