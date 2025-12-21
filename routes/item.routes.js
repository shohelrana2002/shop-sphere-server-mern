import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  addItem,
  deleteItemById,
  editItem,
  getItemAll,
  getItemById,
} from "../controllers/item.controllers.js";
import { upload } from "../middlewares/multer.js";
const itemRouter = express.Router();

itemRouter.post("/add-item", isAuth, upload.single("image"), addItem);
itemRouter.put("/edit-item/:itemId", isAuth, upload.single("image"), editItem);
itemRouter.get("/get-item/:itemId", getItemById);
itemRouter.delete("/delete-item/:itemId", deleteItemById);
itemRouter.get("/allItems-get", getItemAll);

export default itemRouter;
