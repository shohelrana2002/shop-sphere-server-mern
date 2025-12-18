import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/token.js";
import { sendOtpEmail } from "../utils/mail.js";

//  register controller
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    if (!fullName || !email || !password || !mobile || !role) {
      return res.status(400).json({ message: "All fields are required" });
    }
    const allowedRoles = ["user", "owner", "deliveryBoy"];
    if (!allowedRoles.includes(role)) {
      return res.status(400).json({ message: "Invalid role" });
    }
    if (!password || password.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (!mobile || mobile.length < 11) {
      return res.status(400).json({
        message: "Invalid mobile number or Mobile number is too short ",
      });
    }
    const isExisting = await User.findOne({ email });
    if (isExisting) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({
      fullName,
      email,
      password: passwordHash,
      mobile,
      role,
    });
    const token = await generateToken(user?._id);
    res.cookie("token", token, {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res
      .status(201)
      .json({ message: "User registered successfully", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "Server Error", error: error.message });
  }
};
// login controller
export const signIn = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User Cannot be found" });
    }
    if (!password || password?.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }

    const passwordHash = await bcrypt.compare(password, user.password);
    if (!passwordHash) {
      return res.status(400).json({ message: "Password is incorrect" });
    }
    const token = await generateToken(user?._id);
    res.cookie("token", token, {
      secure: false,
      httpOnly: true,
      sameSite: "strict",
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    return res.status(200).json({ message: "User login successfully", user });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "sign in error", error: error.message });
  }
};

// logout controller
export const signOut = async (req, res) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "signOut error", error: error.message });
  }
};

// otp send controller
export const sendOtp = async (req, res) => {
  // to be implemented
  try {
    // step------------------1
    const { email } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    // step------------------2
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    user.resetOtp = otp;
    user.optExpiry = Date.now() + 5 * 60 * 1000; // 5 minutes from now
    user.isOtpVerified = false;
    await user.save();
    // step------------------3
    await sendOtpEmail(email, otp);
    // step------------------4
    return res.status(200).json({ message: "OTP sent successfully", otp });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "sendOtp error", error: error.message });
  }
};

export const verifyOtp = async (req, res) => {
  // to be implemented
  try {
    const { email, otp } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.optExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    user.isOtpVerified = true;
    user.resetOtp = undefined;
    user.optExpiry = undefined;
    await user.save();
    return res.status(200).json({ message: "OTP verified successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "verifyOtp error", error: error.message });
  }
};

export const resetPassword = async (req, res) => {
  try {
    const { email, otp, newPassword } = req.body;
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "User not found" });
    }
    if (user.resetOtp !== otp) {
      return res.status(400).json({ message: "Invalid OTP" });
    }
    if (user.optExpiry < Date.now()) {
      return res.status(400).json({ message: "OTP expired" });
    }
    if (!newPassword || newPassword?.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    const passwordHash = await bcrypt.hash(newPassword, 10);
    user.password = passwordHash;
    user.resetOtp = undefined;
    user.isOtpVerified = false;
    user.optExpiry = undefined;
    await user.save();
    return res.status(200).json({ message: "Password reset successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "resetPassword error", error: error.message });
  }
};
