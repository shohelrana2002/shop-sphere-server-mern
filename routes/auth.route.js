import express from "express";
import {
  googleAuthControls,
  resetPassword,
  sendOtp,
  signIn,
  signOut,
  signUp,
  verifyOtp,
} from "../controllers/auth.controller.js";

const authRouter = express.Router();

// post route for user signup

authRouter.post("/signup", signUp);
authRouter.post("/signin", signIn);
authRouter.get("/signout", signOut);
// forgot password
authRouter.post("/otp-send", sendOtp);
authRouter.post("/verify-otp", verifyOtp);
authRouter.post("/reset-password", resetPassword);
/*===============social route======================*/
authRouter.post("/google-auth", googleAuthControls);

export default authRouter;
