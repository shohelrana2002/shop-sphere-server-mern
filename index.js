import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";
dotenv.config();
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.route.js";

const app = express();
const PORT = process.env.PORT || 5000;

/* ========== CORS Configuration ========== */
app.use(
  cors({
    origin: "http://localhost:5174",
    credentials: true,
  })
);

/* ========== Middlewares ========== */
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);

/* ========== Test Route ========== */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* ========== Server ========== */

app.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
