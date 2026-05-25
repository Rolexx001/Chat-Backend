import jwt from 'jsonwebtoken';
import { findbyId } from '../modules/auth/auth.repositories.js';

export const protect=async(req,res,next)=>{
    try{
        let token;
        if(req.headers.authorization && req.headers.authorization.startsWith('Bearer')){
            token=req.headers.authorization.split(' ')[1];
    
        }
        if(!token){
            return res.status(401).json({
                message:"No Token",
            });
        }
        const decoded=jwt.verify(token,process.env.ACCESS_TOKEN_SECRET);
        const user=await findbyId(decoded.userId);
        if(!user){
            return res.status(401).json({
                message:"No User",
            });
        }
        req.userId=user._id;
        req.user=user;
        next();
    } catch(error){
        res.status(401).json({ message: "Invalid token" });
        
    }

};