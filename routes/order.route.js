import express from "express";
import { isAuth } from "../middlewares/isAuth.js";

import {
  getMyOrders,
  ordersStatusUpdate,
  placeOrder,
} from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.post("/place-orders", isAuth, placeOrder);
orderRouter.put("/update-status/:orderId", isAuth, ordersStatusUpdate);

export default orderRouter;
