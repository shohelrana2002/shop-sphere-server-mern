import Shop from "../models/shop.model.js";
import uploadCloudinary from "../utils/cloudinary.js";

export const creteOrEditShop = async (req, res) => {
  try {
    const { name, city, state, address } = req.body;
    let image;
    if (req?.file) {
      image = await uploadCloudinary(req?.file?.path);
    }
    let shop = await Shop.findOne({ owner: req?.userId });
    if (!shop) {
      shop = await Shop.create({
        name,
        city,
        state,
        address,
        image,
        owner: req?.userId,
      });
    } else {
      shop = await Shop.findByIdAndUpdate(
        shop?._id,
        {
          name,
          city,
          state,
          address,
          image,
          owner: req?.userId,
        },
        { new: true }
      );
    }

    await shop.populate("owner items");
    return res.status(201).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `Shop created Failed:${error}` });
  }
};

// get owner shop

export const getMyShop = async (req, res) => {
  try {
    const shop = await Shop.findOne({ owner: req.userId }).populate({
      path: "owner items",
      options: { sort: { updatedAt: -1 } },
    });
    if (!shop) {
      return res.status(400).json({ message: "No Shop Found" });
    }

    return res.status(200).json(shop);
  } catch (error) {
    return res.status(500).json({ message: `No Shop Found error:${error}` });
  }
};

//  get Shop By CurrentCity

export const getShopByCity = async (req, res) => {
  try {
    const { city } = req.params;
    const shop = await Shop.find({
      city: { $regex: new RegExp(`^${city}$`, "i") },
    }).populate("items");
    if (!shop) {
      return res.status(400).json({ message: "No Shop Found Your City" });
    }
    return res.status(200).json(shop);
  } catch (error) {
    return res
      .status(500)
      .json({ message: `No Shop Find In Current City Error:${error}` });
  }
};
