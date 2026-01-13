import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import {
  creteOrEditShop,
  getMyShop,
  getShopByCity,
} from "../controllers/shop.controllers.js";
import { upload } from "../middlewares/multer.js";
const shopRouter = express.Router();

shopRouter.post(
  "/create-edit",
  isAuth,
  upload.single("image"),
  creteOrEditShop
);
shopRouter.get("/get-myShop", isAuth, getMyShop);
shopRouter.get("/get-By-city/:city", isAuth, getShopByCity);

export default shopRouter;
