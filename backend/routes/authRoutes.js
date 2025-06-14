import express from "express";

import jwt from "jsonwebtoken";
import { autoLogin, login } from "../controllers/authController";

export const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer")) {
    res.status(401).json({ message: "No token found or invalid token" });
  }

  const token = authHeader?.split(" ")[1];

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === "TokenExpiredError") {
      res.status(401).json({ message: "Expired token" });
    } else if (error.name === "JsonWebTokenError") {
      res.status(401).json({ message: "Invalid token" });
    } else {
      res.status(500).json({ message: "Failed to authenticate token" });
    }
  }
};

const router = express.Router();

router.post("/login", login);
router.post("/me", verifyToken, autoLogin);

export default router;
