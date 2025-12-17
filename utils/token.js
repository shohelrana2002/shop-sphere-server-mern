import jwt from "jsonwebtoken";
const generateToken = async (userId) => {
  try {
    const token = await jwt.sign({ userId }, process.env.JWT_SECRET, {
      expiresIn: "7d",
    });
    return token;
  } catch (error) {
    console.log("Error generating token");
    throw new Error(error.message);
  }
};
export default generateToken;
