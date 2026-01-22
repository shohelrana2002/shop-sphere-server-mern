import express from "express";
import { isAuth } from "../middlewares/isAuth.js";

import { getMyOrders, placeOrder } from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.get("/my-orders", isAuth, getMyOrders);
orderRouter.post("/place-orders", isAuth, placeOrder);

export default orderRouter;
