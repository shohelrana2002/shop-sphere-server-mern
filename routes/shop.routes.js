import express from "express";
import { isAuth } from "../middlewares/isAuth.js";
import { creteOrEditShop, getMyShop } from "../controllers/shop.controllers.js";
import { upload } from "../middlewares/multer.js";
const shopRouter = express.Router();

shopRouter.post(
  "/create-edit",
  isAuth,
  upload.single("image"),
  creteOrEditShop
);
shopRouter.get("/get-myShop", isAuth, getMyShop);

export default shopRouter;
