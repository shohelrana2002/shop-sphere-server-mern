import nodemailer from "nodemailer";
import dotenv from "dotenv";
dotenv.config();
// Create a transporter for SMTP
const transporter = nodemailer.createTransport({
  service: "Gmail",
  port: 465,
  secure: true,
  auth: {
    user: process.env.EMAIL,
    pass: process.env.PASS,
  },
});

export const sendOtpEmail = async (to, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: to,
      subject: "Reset Your Password - OTP Code",
      html: `
      <h2>Your OTP Code</h2>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This code will expire in 5 minutes</p>
    `,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
export const sendDeliveryOtpMail = async (user, otp) => {
  try {
    await transporter.sendMail({
      from: process.env.EMAIL,
      to: user.email,
      subject: "Delivery OTP",
      html: `
      <h2>Your Delivery OTP Code</h2>
      <p>Your OTP is: <b>${otp}</b></p>
      <p>This code will expire in 5 minutes</p>
    `,
    });
  } catch (error) {
    console.error("Error sending email:", error);
  }
};
