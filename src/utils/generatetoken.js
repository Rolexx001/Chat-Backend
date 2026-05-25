import jwt from 'jsonwebtoken';
//GENERATE ACCESS TOKEN

export const generateAccessToken=(userId)=>{
    return jwt.sign(
        {userId},
        process.env.ACCESS_TOKEN_SECRET,
        {expiresIn: "15m"}
        
    );
};

//GENERATE REFRESH TOKEN

export const generateRefreshToken=(userId)=>{
    return jwt.sign(
        {userId},
        process.env.REFRESH_TOKEN_SECRET,
        {expiresIn:"7d"}
    );
};