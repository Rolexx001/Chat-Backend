import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';

import {generateAccessToken,generateRefreshToken} from '../../utils/generatetoken.js';
import {createUser,saveUser,findbyEmail,findbyId} from './auth.repositories.js';

export const signupUser=async({name,email,password})=>{
    const existingUser=await findbyEmail(email);

    if(existingUser){
        throw new Error('User already exists');
    }

    const hashedPassword=await bcrypt.hash(password,10);
    const user=await createUser({
        name,
        email,
        password:hashedPassword,
    });
    return user;

};

export const loginUser=async({email,password})=>{
    const user=await findbyEmail(email);

    if(!user){
        throw new Error('Invalid credentials');
    }
    const isMatch=await bcrypt.compare(password,user.password);
    if(!isMatch){
        throw new Error('Invalid credentials');
    }
    const accessToken=generateAccessToken(user._id);
    const refreshToken=generateRefreshToken(user._id);
    user.refreshToken=refreshToken;
    await saveUser(user);
    return {user,accessToken,refreshToken};
}

export const refreshAccessToken=async(oldRefreshToken)=>{
    if(!oldRefreshToken){
        throw new Error("No Refresh Token");
    }
    const decoded = jwt.verify(
        oldRefreshToken,
        process.env.REFRESH_TOKEN_SECRET
    );
    const user=await findbyId(decoded.userId);
    if(!user||user.refreshToken!==oldRefreshToken){
        throw new Error("Invalid Refresh Token");
    }
    const newAccessToken=generateAccessToken(user._id);
    const newRefreshToken=generateRefreshToken(user._id);
    user.refreshToken=newRefreshToken;
    await saveUser(user);
    return {newAccessToken,newRefreshToken};
};

export const logoutUser=async(userId)=>{
    const user=await findbyId(userId);
    if(!user){
        throw new Error("User not found");
    }
    user.refreshToken=null;
    await saveUser(user);
    return true;

};

export const updateProfileService = async (userId, {name, bio, avatar}) => {
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
