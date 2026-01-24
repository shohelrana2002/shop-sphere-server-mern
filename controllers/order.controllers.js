import Order from "../models/order.model.js";
import paymentHistoryModel from "../models/paymentHistory.model.js";
import Shop from "../models/shop.model.js";
import User from "../models/user.model.js";

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
            item: i.id,
            name: i.name,
            image: i.image,
            price: i.price,
            quantity: i.quantity,
          })),
        };
      }),
    );
    // order crete now
    const random = Math.floor(1000 + Math.random() * 900000);
    const newOrder = await Order.create({
      user: req.userId,
      paymentMethod: paymentMethod.toLowerCase() || "cod",
      deliveryAddress: {
        text: address,
        latitude: location[0] || 0,
        longitude: location[1] || 0,
      },
      transactionId: `COD:${req.userId.toString().slice(0, 6)}${random}`,
      totalAmount,
      shopOrder,
    });
    await newOrder.populate("shopOrder.shopOrderItem.item", "name image price");
    await paymentHistoryModel.create({
      user: req.userId,
      order: newOrder._id,
      paymentGateway: "COD",
      transactionId: `COD:${req.userId.toString().slice(0, 6)}${random}`,
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
    const user = await User.findById(req.userId);
    if (user.role === "user") {
      const orders = await Order.find({ user: req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrder.shop", "name")
        .populate("shopOrder.owner", "name email mobile")
        .populate("shopOrder.shopOrderItem.item", "name image price");

      return res.status(200).json(orders);
    } else if (user.role === "owner") {
      let orders = await Order.find({ "shopOrder.owner": req.userId })
        .sort({ createdAt: -1 })
        .populate("shopOrder.shop", "name")
        .populate("user")
        .populate("shopOrder.shopOrderItem.item", "name image price");

      //  filter shopOrder for this owner only
      orders = orders.map((order) => {
        const filteredShopOrder = order?.shopOrder?.filter(
          (shop) => shop?.owner?.toString() === req?.userId?.toString(),
        );

        return {
          ...order.toObject(),
          shopOrder: filteredShopOrder,
        };
      });

      return res.status(200).json(orders);
    }
  } catch (error) {
    console.error("Get my orders error:", error);
    res.status(500).json({ message: `Failed to fetch orders error:${error}` });
  }
};

export const ordersStatusUpdate = async (req, res) => {
  try {
    const { status, shopId } = req.body; // shopId
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    // find correct shop order
    const shopOrder = order.shopOrder.find((s) => s.shop.toString() === shopId);

    if (!shopOrder)
      return res.status(404).json({ message: "Shop order not found" });

    shopOrder.status = status; // correct place

    await order.save();

    res.status(200).json({ success: true, status });
  } catch (error) {
    res.status(500).json({ message: `Status Updated error: ${error}` });
  }
};
