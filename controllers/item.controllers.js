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
    return res.status(201).json(item);
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
    return res.status(200).json(item);
  } catch (error) {
    return res.status(500).json({ message: `Item Edit failed :${error}` });
  }
};
