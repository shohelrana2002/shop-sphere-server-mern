import SSLCommerzPayment from "sslcommerz-lts";
import { v4 as uuidv4 } from "uuid";
import dotenv from "dotenv";
import Order from "../models/order.model.js";
import paymentHistoryModel from "../models/paymentHistory.model.js";

dotenv.config();

const store_id = process.env.SSLCOMMERZ_STORE_ID;
const store_passwd = process.env.SSLCOMMERZ_STORE_PASS;
const is_live = false; // sandbox

export const sslcommerzInit = async (req, res) => {
  try {
    const {
      totalPrice,
      userData,
      address,
      location,
      cartItems,
      paymentMethod,
    } = req.body;

    if (!totalPrice || !userData || !address) {
      return res.status(400).json({ message: "Missing required fields" });
    }

    const tran_id = uuidv4();
    const serverUrl = process.env.SERVER_URL || "http://localhost:3000";

    const data = {
      total_amount: Number(totalPrice),
      currency: "BDT",
      tran_id,
      success_url: `${serverUrl}/api/payment/success/${tran_id}`,
      fail_url: `${serverUrl}/api/payment/fail/${tran_id}`,
      cancel_url: `${serverUrl}/api/payment/cancel/${tran_id}`,
      ipn_url: `${serverUrl}/api/payment/ipn`,
      shipping_method: "Courier",
      product_name: "Food Order",
      product_category: "Food",
      product_profile: "general",
      cus_name: userData.fullName || "Customer Name",
      cus_email: userData.email || "demo@example.com",
      cus_add1: address || "Dhaka",
      cus_city: "Dhaka",
      cus_country: "Bangladesh",
      cus_phone: userData.mobile || "8801XXXXXXXXX",
      cus_postcode: "1207",
      ship_name: userData.fullName || "Customer Name",
      ship_add1: address || "Dhaka",
      ship_city: "Dhaka",
      ship_country: "Bangladesh",
      ship_postcode: "1207",
    };

    const sslcz = new SSLCommerzPayment(store_id, store_passwd, is_live);

    const apiResponse = await sslcz.init(data);
    ///

    const groupedByShop = {};

    cartItems.forEach((item) => {
      const shopId = item.shop._id || item.shop;

      if (!groupedByShop[shopId]) {
        groupedByShop[shopId] = {
          shop: shopId,
          owner: item.shop.owner,
          subTotal: 0,
          shopOrderItem: [],
        };
      }

      groupedByShop[shopId].shopOrderItem.push({
        item: item._id,
        price: item.price,
        name: item.name,
        quantity: item.quantity,
        image: item.image,
      });

      groupedByShop[shopId].subTotal += item.price * item.quantity;
    });
    const shopOrder = Object.values(groupedByShop);

    // Save order in MongoDB
    const order = await Order.create({
      user: userData._id,
      paymentMethod: (paymentMethod || "online").toLowerCase(), // lowercase
      deliveryAddress: {
        text: address,
        latitude: location[0] || 0,
        longitude: location[1] || 0,
      },
      totalAmount: Number(totalPrice),
      shopOrder: shopOrder || [],
      paymentStatus: "PENDING",
      transactionId: tran_id,
    });
    // Payment History
    await paymentHistoryModel.create({
      user: userData._id,
      order: order._id,
      transactionId: tran_id,
      amount: Number(totalPrice),
      status: "PENDING",
    });
    if (!apiResponse || !apiResponse.GatewayPageURL) {
      return res.status(500).json({
        message: "Payment initialization failed",
        response: apiResponse,
      });
    }

    return res.json({ url: apiResponse.GatewayPageURL });
  } catch (err) {
    console.error("SSLCommerz ERROR:", err);
    return res
      .status(500)
      .json({ message: "Payment init failed", error: err.message });
  }
};

// Success, Fail, Cancel endpoints
export const paymentSuccess = async (req, res) => {
  const { tran_id } = req.params;
  await Order.findOneAndUpdate(
    { transactionId: tran_id },
    { paymentStatus: "PAID" },
  );
  await paymentHistoryModel.findOneAndUpdate(
    { transactionId: tran_id },
    { status: "PAID" },
  );

  res.redirect(`http://localhost:5173/payment-success/${tran_id}`);
};

export const paymentFail = async (req, res) => {
  const { tran_id } = req.params;

  await paymentHistoryModel.findOneAndUpdate(
    { transactionId: tran_id },
    {
      status: "FAILED",
      rawResponse: req.body,
    },
  );

  res.redirect("http://localhost:5173/payment-failed");
};

export const paymentCancel = async (req, res) => {
  const { tran_id } = req.params;

  await paymentHistoryModel.findOneAndUpdate(
    { transactionId: tran_id },
    {
      status: "CANCELLED",
      rawResponse: req.body,
    },
  );

  res.redirect("http://localhost:5173/payment-cancelled");
};
