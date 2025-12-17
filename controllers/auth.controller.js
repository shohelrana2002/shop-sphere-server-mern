import User from "../models/user.model.js";
import bcrypt from "bcryptjs";
import generateToken from "../utils/token.js";

//  register controller
export const signUp = async (req, res) => {
  try {
    const { fullName, email, password, mobile, role } = req.body;
    const isExisting = await User.findOne({ email });
    if (isExisting) {
      return res
        .status(400)
        .json({ message: "User already exists with this email" });
    }
    if (!password || password?.length < 6) {
      return res
        .status(400)
        .json({ message: "Password must be at least 6 characters long" });
    }
    if (!mobile || mobile.length < 11) {
      return res.status(400).json({
        message: "Invalid mobile number or Mobile number is too short ",
      });
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
      return res.status(400).json({ message: "Invalid credentials Password" });
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
export const signOut = async (req, rs) => {
  try {
    res.clearCookie("token");
    return res.status(200).json({ message: "User logged out successfully" });
  } catch (error) {
    return res
      .status(500)
      .json({ message: "signOut error", error: error.message });
  }
};
