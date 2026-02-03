import express from "express";
import { isAuth } from "../middlewares/isAuth.js";

import {
  acceptOrder,
  getCurrentOrder,
  getDeliveryBoyAssignment,
  getMyOrders,
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
orderRouter.get("/accept-order/:assignmentId", isAuth, acceptOrder);
orderRouter.post("/reject/:assignmentId", isAuth, rejectOrder);

export default orderRouter;
