import Order from "../models/order.model.js";
import paymentHistoryModel from "../models/paymentHistory.model.js";
import Shop from "../models/shop.model.js";

export const placeOrder = async (req, res) => {
  try {
    const { cartItems, location, paymentMethod, totalAmount, address } =
      req.body;
    if (cartItems?.length == 0 || !cartItems) {
      return res.status(400).json({ message: "Cart Item,s empty" });
    }
    if (!address) {
      return res.status(400).json({ message: "Enter a Full Address" });
    }
    // shop item loop here
    const groupItemsByShop = {};
    cartItems.forEach((item) => {
      const shopId = item.shop;
      if (!groupItemsByShop[shopId]) {
        groupItemsByShop[shopId] = [];
      }
      groupItemsByShop[shopId].push(item);
    });

    const shopOrder = await Promise.all(
      Object.keys(groupItemsByShop).map(async (shopId) => {
        const shop = await Shop.findById(shopId).populate("owner");
        if (!shop) {
          return res.status(400).json({ message: "No Shop Data  Found !!" });
        }
        const items = groupItemsByShop[shopId];
        const subTotal = items.reduce(
          (sum, i) => sum + Number(i?.price) * Number(i?.quantity),
          0,
        );
        return {
          shop: shop?._id,
          owner: shop?.owner?._id,
          subTotal,
          shopOrderItem: items.map((i) => ({
            item: i._id,
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
          })),
        };
      }),
    );
    // order crete now

    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod: paymentMethod.toLowerCase() || "cod",
      deliveryAddress: {
        text: address,
        latitude: location[0] || 0,
        longitude: location[1] || 0,
      },
      totalAmount,
      shopOrder,
    });

    await paymentHistoryModel.create({
      user: req.userId,
      order: newOrder._id,
      paymentGateway: "COD",
      transactionId: `COD:${newOrder._id?.toString().slice(0, 8)}`,
      amount: Number(totalAmount),
      status: "PENDING",
    });

    return res.status(201).json(newOrder);
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
