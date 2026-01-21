import Order from "../models/order.model.js";

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, paymentMethod, deliveryAddress } = req.body;
    if (cartItems?.length == 0 || !cartItems) {
      return res.status(400).json({ message: "Cart Item,s empty" });
    }
    if (
      deliveryAddress?.text ||
      !deliveryAddress?.latitude ||
      !deliveryAddress?.longitude
    ) {
      return res.status(400).json({ message: "Enter a Full Address" });
    }

    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      //
    });
  } catch (error) {
    return res.status(500).json({ message: `Place Order Error:${error}` });
  }
};

export const getMyOrders = async (req, res) => {
  try {
    const userId = req.userId;

    const orders = await Order.find({ user: userId })
      .sort({ createdAt: -1 })
      .lean();

    return res.status(200).json({
      success: true,
      count: orders.length,
      orders,
    });
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch orders",
    });
  }
};
