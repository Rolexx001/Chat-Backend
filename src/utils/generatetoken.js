import jwt from 'jsonwebtoken';
//GENERATE ACCESS TOKEN

export const generateAccessToken = (userId, sessionId) => {
    return jwt.sign(
        { userId, sessionId },
        process.env.ACCESS_TOKEN_SECRET,
        { expiresIn: "1d" }

    );
};

//GENERATE REFRESH TOKEN

export const generateRefreshToken = (userId, sessionId) => {
    return jwt.sign(
        { userId, sessionId },
        process.env.REFRESH_TOKEN_SECRET,
        { expiresIn: "7d" }
    );
};