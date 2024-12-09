import express from "express";
import {
  registerUser,
  verify,
  loginUser,
  myProfile,
  logoutUser,
  updateProfile,
  changePassword,
  forgotPassword,
  resetPassword,
} from "../controller/user.js";
import { deleteUser,getSingleUser,updateUser,getAllUsers} from "../controller/admin.js";
import { getAdminProducts } from "../controller/product.js";
import { isAuth } from "../middleware/isAuth.js";
import multer from "multer";
import path from "path";
import { fileURLToPath } from "url";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const upload = multer({
  storage: multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, path.join(__dirname, "..", "uploads/user"));
    },
    filename(req, file, cb) {
      cb(null, file.originalname);
    },
  }),
});

const userRouter = express.Router();

userRouter.post("/user/register", upload.single("avatar"), registerUser);
userRouter.post("/user/verify", verify);
userRouter.post("/user/login", loginUser);
userRouter.get("/user/profile", isAuth, myProfile);
userRouter.get("/user/logout",logoutUser);
userRouter.post("/user/forgot-password", forgotPassword);
userRouter.post("/user/reset-password/:token", resetPassword);
userRouter.put("/user/change-password", isAuth, changePassword);
userRouter.put("/user/update", isAuth, upload.single("avatar"), updateProfile);

//admin
userRouter.get('/admin/users',isAuth,getAllUsers);
userRouter.get('/admin/user/:id',isAuth,getSingleUser);
userRouter.put('/admin/user/:id',isAuth,updateUser);
userRouter.delete('/admin/user/:id',isAuth,deleteUser);

export default userRouter;
