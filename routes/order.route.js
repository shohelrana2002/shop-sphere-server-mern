import express from "express";
import { isAuth } from "../middlewares/isAuth.js";

import {
  acceptOrder,
  deliveryOtpVerify,
  getCurrentOrder,
  getDeliveryBoyAssignment,
  getMyOrders,
  getOrderById,
  ordersStatusUpdate,
  placeOrder,
  rejectOrder,
  sendDeliveryOtp,
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.post("/place-orders", isAuth, placeOrder);
orderRouter.post("/send-delivery-otp", isAuth, sendDeliveryOtp);
orderRouter.post("/verify-delivery-otp", isAuth, deliveryOtpVerify);
orderRouter.put("/update-status/:orderId", isAuth, ordersStatusUpdate);
orderRouter.post("/reject/:assignmentId", isAuth, rejectOrder);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);

export default orderRouter;
