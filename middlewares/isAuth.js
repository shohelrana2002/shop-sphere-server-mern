import jwt from "jsonwebtoken";

export const isAuth = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(400).json({ message: "Token Invalid" });
    }
    const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
    if (!decodedToken) {
      return res.status(400).json({ message: "Token no't verify" });
    }
    req.userId = decodedToken.userId;
    next();
  } catch (error) {
    return res
      .status(500)
      .json({ message: "isAuth Middleware error", error: error.message });
  }
};
