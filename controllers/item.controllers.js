import Item from "../models/item.model.js";
import Shop from "../models/shop.model.js";
import uploadCloudinary from "../utils/cloudinary.js";

export const addItem = async (req, res) => {
  try {
    const { name, category, price, stock } = req.body;
    let image;
    if (req?.file) {
      image = await uploadCloudinary(req?.file?.path);
    }
    const shop = await Shop.findOne({ owner: req.userId });
    if (!shop) {
      return res.status(400).json({ message: "Shop Can't find " });
    }
    const item = await Item.create({
      name,
      category,
      price,
      stock,
      image,
      shop: shop._id,
    });
    shop.items.push(item?._id);
    await shop.save();
    await shop.populate("items owner");
    return res.status(201).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Add Item Add Failed error:${error}` });
  }
};

// edit item
export const editItem = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    const { name, category, price, stock } = req.body;
    let image;
    if (req.file) {
      image = await uploadCloudinary(req.file.path);
    }
    const item = await Item.findByIdAndUpdate(
      itemId,
      {
        name,
        category,
        price,
        stock,
        image,
      },
      { new: true }
    );

    if (!item) {
      return res.status(400).json({ message: "Item Can't find " });
    }
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "items",
      options: { sort: { updatedAt: -1 } },
    });
    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Item Edit failed :${error}` });
  }
};
// get item by id
export const getItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    if (!itemId) {
      return res.status(400).json({ message: "Invalid Item Id" });
    }
    const result = await Item.findById(itemId);
    if (!result) {
      return res.status(400).json({ message: "Cant Find Item Id" });
    }
    return res.status(200).json(result);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Cant't Get Single Item :${error}` });
  }
};

// delete item
export const deleteItemById = async (req, res) => {
  try {
    const itemId = req.params.itemId;
    if (!itemId) {
      return res.status(400).json({ message: "Invalid Item Id" });
    }
    const item = await Item.findByIdAndDelete(itemId);
    if (!item) {
      return res.status(400).json({ message: "Cant Find Item Id" });
    }

    // const shop = await Shop.findOne({ owner: req?.userId });
    // shop.items = shop?.items?.filter((i) => i?._id !== item?._id);
    // await shop.save();
    // await shop.populate({
    //   path: "items",
    //   options: { sort: { updatedAt: -1 } },
    // });
    return res.status(200).json(item);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `Cant't Get Delete Item :${error}` });
  }
};

// get item
export const getItemAll = async (req, res) => {
  try {
    // const { shopId } = req.params;

    const items = await Item.find({})
      .populate("shop", "name image")
      .sort({ createdAt: -1 });

    res.status(200).json(items);
  } catch (error) {
    res.status(500).json({
      message: "Item get failed",
      error: error.message,
    });
  }
};
