import express from "express";
import {
  sslcommerzInit,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} from "../controllers/payment.controller.js";

const paymentRouter = express.Router();

paymentRouter.post("/sslcommerz", sslcommerzInit);
paymentRouter.post("/success/:tran_id", paymentSuccess);
paymentRouter.post("/fail/:tran_id", paymentFail);
paymentRouter.post("/cancel/:tran_id", paymentCancel);

export default paymentRouter;
