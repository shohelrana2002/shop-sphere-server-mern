import express from "express";
import { isAuth } from "../middlewares/isAuth.js";

import { getMyOrders } from "../controllers/order.controllers.js";

const orderRouter = express.Router();

orderRouter.get("/my-orders", isAuth, getMyOrders);

export default orderRouter;
