import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import dotenv from "dotenv";

dotenv.config();
import connectDB from "./config/db.js";
import authRouter from "./routes/auth.route.js";
import userRouter from "./routes/user.routes.js";
import shopRouter from "./routes/shop.routes.js";
import itemRouter from "./routes/item.routes.js";
import paymentRouter from "./routes/payment.route.js";
import orderRouter from "./routes/order.route.js";
import http from "http";
import { Server } from "socket.io";
import { socketHandler } from "./socket.js";

const app = express();
// socket io crete http
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "http://localhost:5173",
    credentials: true,
    methods: ["POST", "GET"],
  },
});
app.set("io", io);

const PORT = process.env.PORT || 5000;

/* ========== CORS Configuration ========== */
app.use(
  cors({
    origin: "http://localhost:5173",
    credentials: true,
  }),
);

/* ========== Middlewares ========== */
app.use(express.json());
app.use(cookieParser());
app.use("/api/auth", authRouter);
app.use("/api/user", userRouter);
app.use("/api/shop", shopRouter);
app.use("/api/item", itemRouter);
app.use("/api/payment", paymentRouter);
app.use("/api/orders", orderRouter);

/* ========== socket io call here ========== */
socketHandler(io);
/* ========== Test Route ========== */
app.get("/", (req, res) => {
  res.send("API is running 🚀");
});

/* ========== Server ========== */

server.listen(PORT, () => {
  connectDB();
  console.log(`🚀 Server running on port ${PORT}`);
});
