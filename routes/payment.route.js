import express from "express";
import {
  sslcommerzInit,
  paymentSuccess,
  paymentFail,
  paymentCancel,
} from "../controllers/payment.controller.js";

const router = express.Router();

router.post("/sslcommerz", sslcommerzInit);
router.post("/success/:tran_id", paymentSuccess);
router.post("/fail/:tran_id", paymentFail);
router.post("/cancel/:tran_id", paymentCancel);

export default router;
