import DeliveryAssignment from "../models/deliveryAssignment.model.js";
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
    const { status, shopId } = req.body; // shopId status
    const orderId = req.params.orderId;

    const order = await Order.findById(orderId);
    if (!order) return res.status(404).json({ message: "Order not found" });

    /* find correct shop order*/
    const shopOrder = order.shopOrder.find((s) => s.shop.toString() === shopId);

    if (!shopOrder)
      return res.status(404).json({ message: "Shop order not found" });

    shopOrder.status = status;
    // location to Delivery Boy Find Here
    let deliveryBoysPayLoad = [];
    if (status === "out of delivery" && !shopOrder.assignment) {
      const { longitude, latitude } = order.deliveryAddress;
      const nearByDeliveryBoys = await User.find({
        role: "deliveryBoy",
        location: {
          $near: {
            $geometry: {
              type: "Point",
              coordinates: [Number(longitude), Number(latitude)],
            },
            $maxDistance: 100000, // 1km= 1000 ====100km
          },
        },
      });

      const nearByIds = nearByDeliveryBoys.map((nearId) => nearId._id);
      const busyIds = await DeliveryAssignment.find({
        assignedTo: { $in: nearByIds },
        status: { $nin: ["broadcasted", "completed"] },
      }).distinct("assignedTo");
      const busyIdSet = new Set(busyIds.map((id) => String(id)));
      const availableBoys = nearByDeliveryBoys.filter(
        (b) => !busyIdSet.has(String(b._id)),
      );
      const candidates = availableBoys.map((b) => b._id);
      if (candidates.length === 0) {
        await order.save();
        return res.json({ message: "No Available Delivery Boy" });
      }
      const deliveryAssignment = await DeliveryAssignment.create({
        order: order._id,
        shop: shopOrder.shop,
        shopOrderId: shopOrder._id,
        broadcastedTo: candidates,
        status: "broadcasted",
      });
      shopOrder.assignedDeliveryBoy = deliveryAssignment.assignedTo;
      shopOrder.assignment = deliveryAssignment._id;
      deliveryBoysPayLoad = availableBoys.map((b) => ({
        id: b._id,
        fullName: b.fullName,
        longitude: b.location.coordinates?.[0] || 0,
        latitude: b.location.coordinates?.[1] || 0,
        mobile: b.mobile,
      }));
    }
    await order.save();
    const updatedShopOrder = order.shopOrder.find(
      (s) => s.shop._id.toString() === shopId.toString(),
    );
    await order.populate("shopOrder.shop", "name");
    await order.populate("shopOrder.assignedDeliveryBoy"); // fullName email mobile

    res.status(200).json({
      shopOrder: updatedShopOrder,
      assignedDeliveryBoy: updatedShopOrder.assignedDeliveryBoy,
      availableBoys: deliveryBoysPayLoad,
      assignment: updatedShopOrder?.assignment?._id,
    });
  } catch (error) {
    res.status(500).json({ message: `Status Updated error: ${error}` });
  }
};

/* =========== Get Assignment ====== */

export const getDeliveryBoyAssignment = async (req, res) => {
  try {
    const deliveryBoyId = req.userId;
    const assignment = await DeliveryAssignment.find({
      broadcastedTo: deliveryBoyId,
      status: "broadcasted",
    })
      .populate("order")
      .populate("shop");
    const format = assignment.map((a) => ({
      assignmentId: a._id,
      orderId: a.order._id,
      shopName: a.shop.name,
      deliveryAddress: a.order.deliveryAddress,
      items:
        a.order.shopOrder.find((item) => (item._id = a.shopOrderId))
          .shopOrderItem || [],
      subTotal: a.order.shopOrder.find((item) => (item._id = a.shopOrderId))
        ?.subTotal,
    }));
    return res.status(200).json(format);
  } catch (error) {
    return res.status(500).json({
      message: `Get Delivery Assignment Error:${error}`,
    });
  }
};

/* =========== Accept Assignment Delivery Boy Order ====== */

export const acceptOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;
    const assignment = await DeliveryAssignment.findById(assignmentId);
    if (!assignment) {
      return res.status(400).json({ message: "No Assignment Order Find" });
    }
    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "Assignment is Expired" });
    }

    const alreadyAssigned = await DeliveryAssignment.findOne({
      assignedTo: req.userId,
      status: { $nin: ["broadcasted", "completed"] },
    });
    if (alreadyAssigned) {
      return res
        .status(400)
        .json({ message: "You Are Already Assigned to Another Order" });
    }
    assignment.assignedTo = req.userId;
    assignment.status = "assigned";
    assignment.acceptedAt = new Date();
    await assignment.save();
    const order = await Order.findById(assignment.order);
    if (!order) {
      return res.status(400).json({ message: "Order no't Find" });
    }
    const shopOrder = order.shopOrder.find(
      (shop) => shop._id.toString() === assignment.shopOrderId.toString(),
    );

    if (!shopOrder) {
      return res.status(400).json({ message: "Shop order not found" });
    }

    shopOrder.assignedDeliveryBoy = req.userId;

    await order.save();
    await order.populate("shopOrder.assignedDeliveryBoy");
    return res.status(200).json({
      message: "Order Accepted",
    });
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Accept Order Delivery Boy Error :${error}` });
  }
};
export const rejectOrder = async (req, res) => {
  try {
    const { assignmentId } = req.params;

    const assignment = await DeliveryAssignment.findById(assignmentId);

    if (!assignment) {
      return res.status(400).json({ message: "Assignment not found" });
    }

    // Already accepted?
    if (assignment.status !== "broadcasted") {
      return res.status(400).json({ message: "Assignment not available" });
    }

    // Prevent duplicate reject
    if (assignment.rejectedBy.includes(req.userId)) {
      return res.status(400).json({ message: "Already rejected" });
    }

    assignment.rejectedBy.push(req.userId);
    await assignment.save();

    return res.status(200).json({
      message: "Order rejected. Waiting for other riders.",
    });
  } catch (error) {
    return res.status(500).json({
      message: `Reject Order Error: ${error.message}`,
    });
  }
};
