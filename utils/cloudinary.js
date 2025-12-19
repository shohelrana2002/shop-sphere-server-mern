import { v2 as cloudinary } from "cloudinary";
import fs from "fs";
import dotenv from "dotenv";
dotenv.config();

const uploadCloudinary = async (file) => {
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_SECRET,
  });
  try {
    const result = await cloudinary.uploader.upload(file);
    fs.unlinkSync(file);
    return result?.secure_url;
  } catch (error) {
    console.log(error);
    fs.unlinkSync(file);
  }
};

export default uploadCloudinary;
