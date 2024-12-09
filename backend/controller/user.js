import { User } from "../modules/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import sendMAil from "../middleware/mail.js";
import sendMail from "../middleware/mail.js";
// user registration
export const registerUser = async (req, res) => {
  try {
    const { name, email, password, contact } = req.body;
    let avatar;
    let BASE_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === "production") {
      BASE_URL = `${req.protocol}://${req.get("host")}`;
    }
    if (req.file) {
      avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`;
    }

    // Check if user already exists
    let user = await User.findOne({ email });
    if (user) {
      return res.status(400).json({
        message: "Email already exists",
      });
    }

    const hashpassword = await bcrypt.hash(password, 10);
    const otp = Math.floor(Math.random() * 1000000);
    user = { name, email, hashpassword, contact, avatar };
    const activeToken = jwt.sign({ user, otp }, process.env.ACTIVATION_KEY, {
      expiresIn: "5m", // Expire after 5 minutes
    });
    console.log('Generated OTP:', otp);
    console.log('Generated Active Token:', activeToken);

    // Send OTP to user via email
    const message = `Please verify your account using the OTP. Your OTP is ${otp}`;
    await sendMail(email, "Welcome to Our Service", message);

    return res.status(200).json({
      message: "OTP sent to your email",
      activeToken, // Include activeToken to use on the verification page
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// verify otp
export const verify = async (req, res) => {
  try {
    const { otp, activeToken } = req.body; // OTP entered by user and active token

    console.log("Received OTP:", otp); // Log received OTP

    // Decode the activeToken using the JWT secret
    // In verify function, you might want to check token expiration and invalid token handling
    const verify = jwt.verify(
      activeToken,
      process.env.ACTIVATION_KEY,
      (err, decoded) => {
        if (err) {
          return res
            .status(400)
            .json({ message: "OTP Expired or Invalid Token" });
        }
        return decoded;
      }
    );

    // If verification fails, return an error
    if (!verify) {
      return res.status(400).json({
        message: "OTP Expired or Invalid Token",
      });
    }

    // Check if the OTP in the token matches the OTP entered by the user
   

    // Proceed with creating the user (if OTP is valid)
    const user = await User.create({
      name: verify.user.name,
      email: verify.user.email,
      password: verify.user.hashpassword,
      contact: verify.user.contact,
      avatar: verify.user.avatar,
    });

    // Create a JWT for the new user
    const token = jwt.sign({ _id: user._id }, process.env.JWT_KEY, {
      expiresIn: "2d",
    });

    return res.status(200).json({
      message: "User registration successful",
      token,
      user,
    });
  } catch (error) {
    console.error("Error:", error);
    return res.status(500).json({
      message: error.message,
    });
  }
};

// login user

export const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const { password: userPasword, ...userDetails } = user.toObject();
    const token = jwt.sign({ _id: user.id }, process.env.JWT_KEY, {
      expiresIn: "2d",
    });
    res.cookie("token", token, {
      path: "/",
      httpOnly: true,
      secure: false, // Only use HTTPS in production
      sameSite: "Lax", // Needed for cross-origin requests
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Welcome" + user.name,
      token,
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

//profile
export const myProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select("-password");
    return res.status(200).json({
      user,
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};
//Logout
export const logoutUser = (req, res) => {
  res
    .cookie("token", null, {
      expires: new Date(Date.now()),
      httpOnly: true,
    })
    .status(200)
    .json({
      success: true,
      message: "Loggedout",
    });
};
// forgot password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({
        message: "Email not found",
      });
    }
    const token = jwt.sign({ _id: user.id }, process.env.RESET_PASSWORD_KEY, {
      expiresIn: "10m",
    });
    let BASE_URL = process.env.CLIENT_URL;
    if (process.env.NODE_ENV === "production") {
      BASE_URL = `${req.protocol}://${req.get("host")}`;
    }
    const message = `Please click on this link to reset your password: ${BASE_URL}/reset-password/${token}`;
    await sendMail(email, "Forgot Password", message);
    return res.status(200).json({
      message: "Reset password link sent to your email",
    });
  } catch (error) {
    return res.status(500).json({
      message: error.message,
    });
  }
};

// reset password
export const resetPassword = async (req, res) => {
  try {
    // Get the token from the URL parameters
    const token = req.params.token;

    const { password, confirmPassword } = req.body;

    if (!token) {
      return res.status(400).json({ message: "Reset token is required" });
    }
    if (!password) {
      return res.status(400).json({ message: "New password is required" });
    }
    if (password !== confirmPassword) {
      return res.status(400).json({ message: "Password does not match" });
    }

    const decoded = jwt.verify(token, process.env.RESET_PASSWORD_KEY);
    const user = await User.findById(decoded._id);
    if (!user) {
      return res.status(400).json({ message: "Invalid reset token" });
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    user.password = hashedPassword;
    await user.save();

    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

//change password
export const changePassword = async (req, res) => {
  try {
    const { oldPassword } = req.body;
    const user = await User.findById(req.user._id);
    const isValidPassword = await bcrypt.compare(oldPassword, user.password);
    if (!isValidPassword) {
      return res.status(400).json({
        message: "Old Password is incorrect",
        status: 401,
      });
    }
    user.password = req.body.password;
    await user.save();
    return res.status(200).json({ message: "Password changed successfully" });
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};
//Update Profile
export const updateProfile = async (req, res) => {
  try {
    let newUserData = {
      name: req.body.name,
      email: req.body.email,
    };

    let avatar;
    let BASE_URL = process.env.BACKEND_URL;
    if (process.env.NODE_ENV === "production") {
      BASE_URL = `${req.protocol}://${req.get("host")}`;
    }

    if (req.file) {
      avatar = `${BASE_URL}/uploads/user/${req.file.originalname}`;
      newUserData = { ...newUserData, avatar };
    }

    const user = await User.findByIdAndUpdate(req.user.id, newUserData, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
