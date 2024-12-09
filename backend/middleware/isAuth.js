import jwt from "jsonwebtoken";
import { User } from "../modules/User.js";

export const isAuth = async(req,res,next) => {
    
    try{
        const token = req.cookies.token;
        
        if(!token){
            return res.status(403).json({message:"login to access"});
        }
        const decoded = jwt.verify(token,process.env.JWT_KEY);
        req.user = await User.findById(decoded._id);
        next();
    }catch(error){
        return res.status(403).json({message:"Auth failed"})
    }
}

