import express from "express";
import {
  addFriend,
  createUser,
  deleteUser,
  forgotPassword,
  getFriends,
  getUser,
  updateInfo,
  updatePassword,
  verifyFriend,
} from "../controllers/userController";
import { verifyToken } from "./authRoutes";

const router = express.Router();

router.post("/getOne", verifyToken, getUser);
router.post("/", createUser);
router.delete("/profile/:id", verifyToken, deleteUser);
router.post("/forgotMy", forgotPassword);
router.patch("/updatePassword", updatePassword);
router.patch("/:id/updateInfo", verifyToken, updateInfo);
router.post("/friend", verifyToken, addFriend);
router.get("/:id/friends", verifyToken, getFriends);
router.post("/verifyFriend", verifyToken, verifyFriend);

export default router;
