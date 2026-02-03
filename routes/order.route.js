import express from "express";
import { isAuth } from "../middlewares/isAuth.js";

import {
  acceptOrder,
  getCurrentOrder,
  getDeliveryBoyAssignment,
  getMyOrders,
  getOrderById,
  ordersStatusUpdate,
  placeOrder,
  rejectOrder,
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.get("/get-assignments", isAuth, getDeliveryBoyAssignment);
orderRouter.get("/get-current-order", isAuth, getCurrentOrder);
orderRouter.post("/place-orders", isAuth, placeOrder);
orderRouter.put("/update-status/:orderId", isAuth, ordersStatusUpdate);
orderRouter.post("/reject/:assignmentId", isAuth, rejectOrder);
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.get("/get-order-by-id/:orderId", isAuth, getOrderById);

export default orderRouter;
