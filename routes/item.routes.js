import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addItem,
  deleteItemById,
  editItem,
  getItemAll,
  getItemByCity,
  getItemById,
  getItemsByShopId,
} from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";
const itemRouter = express.Router();

itemRouter.get("/allItems-get", getItemAll);
itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-item/:itemId", isAuth, getItemById);
itemRouter.delete("/delete-item/:itemId", isAuth, deleteItemById);
itemRouter.get("/get-by-city/:city", isAuth, getItemByCity);
itemRouter.get("/get-by-shop-id/:shopId", isAuth, getItemsByShopId);

export default itemRouter;
