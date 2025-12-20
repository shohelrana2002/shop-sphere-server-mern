import mongoose from "mongoose";

export const itemSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      required: true,
    },
    shop: {
      type: mongoose.Schema.Types.ObjectId,
    },
    category: {
      type: String,
      enum: [
        // Beverages
        "Tea",
        "Coffee",
        "Juice",
        "Soft Drinks",
        // Snacks
        "Samosa",
        "Piyaju",
        "Chop",
        "Fried Snacks",
        // Fast Food
        "Burger",
        "Pizza",
        "French Fries",
        "Sandwich",
        // Rice & Curry
        "Plain Rice",
        "Khichuri",
        "Chicken Curry",
        "Beef Curry",
        "Fish Curry",
        "Vegetable Curry",
        // Sweets
        "Rasgulla",
        "Sandesh",
        "Mishti Doi",
        "Cham Cham",
        // Fruits & Vegetables
        "Seasonal Fruits",
        "Vegetables",
        "Others",
      ],
      required: true,
    },
    price: {
      type: Number,
      min: 0,
      required: true,
    },
    stock: {
      type: Number,
    },
  },
  { timestamps: true }
);

const Item = mongoose.model("Item", itemSchema);
export default Item;
