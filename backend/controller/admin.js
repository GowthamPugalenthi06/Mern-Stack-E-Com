import { User } from "../modules/User.js";
//Admin : Get all users
export const getAllUsers = async (req, res) => {
    try {
        if(req.user.role!="admin"){
            return res.status(403).json({message:"You are not authorized to perform this action"})
        }
        const users = await User.find().select("-password");
        res.status(200).json({ success: true, users });
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
//Admin : Get single user
export const getSingleUser = async (req, res) => {
    try {
        if(req.user.role!="admin"){
            return res.status(403).json({message:"You are not authorized to perform this action"})
        }
        const user = await User.findById(req.params.id).select("-password");
        if(!user){
            return res.status(404).json({ message: "User not found" });
            }
        res.status(200).json({ success: true, user });
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
//Admin : Update user
export const updateUser = async (req, res) => {
    try {
        if(req.user.role!="admin"){
            return res.status(403).json({message:"You are not authorized to perform this action"})
        }
        const newUserData = {
            name:req.body.name,
            email:req.body.email,
            role:req.body.role
        }
        const {id} = req.params
        const user = await User.findByIdAndUpdate(id, newUserData, {new:true, runValidators:true})
        res.status(200).json({
            success:true,
            message:"Profile updated",
            user
            
        })
    }catch(error){
        res.status(500).json({message:error.message})
    }
}
//Admin delete user
export const deleteUser = async (req, res) => {
    try {
        if(req.user.role!="admin"){
            return res.status(403).json({message:"You are not authorized to perform this action"})
        }
        const user = await User.findByIdAndDelete(req.params.id);
        if(!user){
            return res.status(404).json({ message: "User not found" });
            }
        res.status(200).json({ success: true, message: "User deleted" ,});

    }catch(error){
        res.status(500).json({message:error.message})
    }
}