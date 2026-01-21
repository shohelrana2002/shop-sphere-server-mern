import mongoose from "mongoose";

/* shop orderItems schema */
const shopOrderItemSchema = new mongoose.Schema(
  {
    item: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Item",
    },
    price: Number,
    quantity: Number,
  },
  { timestamps: true },
);
/* shop order schema */
const shopOrderSchema = new mongoose.Schema(
  {
    shop: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Shop",
    },
    owner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    subTotal: Number,
    shopOrderItem: [shopOrderItemSchema],
  },
  { timestamps: true },
);

/* Order Schema ==========> main */
const orderSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    paymentMethod: {
      type: String,
      enum: ["cod", "online"],
      required: true,
    },
    deliveryAddress: {
      text: String,
      latitude: Number,
      longitude: Number,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },

    shopOrder: [shopOrderSchema],

    paymentStatus: {
      type: String,
      enum: ["PENDING", "PAID", "FAILED"],
      default: "PENDING",
    },
    transactionId: String,
  },
  { timestamps: true },
);

const Order = mongoose.model("Order", orderSchema);
export default Order;
