import {loginUser,signupUser,refreshAccessToken,logoutUser,updateProfileService} from './auth.services.js';

export const signup=async(req,res,next)=>{
    try{
        const user=await signupUser(req.body);
        res.status(201).json({
            success:true,
            user,
        });
    } catch(error){
        next(error);
    }

};

export const login=async(req,res,next)=>{
    try{
        const {user,accessToken,refreshToken}=await loginUser(req.body);
        res.cookie('refreshToken',refreshToken,{
            httpOnly:true,
            sameSite:"strict",
            secure:false,
        });
        res.status(200).json({
            success:true,
            user,
            accessToken,

        })
    } catch(error){
        next(error);
    }

};

export const refreshTokenController=async(req,res,next)=>{
    try{
        const refreshToken=req.cookies.refreshToken;
        const {newAccessToken,newRefreshToken}=await refreshAccessToken(refreshToken);
        res.cookie('refreshToken',newRefreshToken,{
            httpOnly:true,
            sameSite:"strict",
            secure:false,
        });
        res.status(200).json({
            success:true,
            accessToken:newAccessToken,
        })

    } catch(error){
        next(error);
    }
};

export const logout=async(req,res,next)=>{
    try{
        await logoutUser(req.userId);
        res.clearCookie('refreshToken');
        res.status(200).json({
            success:true,
            message: "Logged out successfully",
        });

    } catch(error){
        next(error);
    }
};

export const getProfile=async(req,res,next)=>{
    try{
        res.status(200).json({
            success:true,
            user:req.user,
        });
    } catch(error){
        next(error);
    }
};

export const updateProfile=async(req,res,next)=>{
    try{
        const user=await updateProfileService(req.userId,req.body);
        res.status(200).json({
            success:true,
            user,
        });
    } catch(error){
        next(error);
    }
};