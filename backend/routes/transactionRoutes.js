import express from "express";
import {
  deposit,
  getTransactionInfo,
  getTransactions,
  paybackLoan,
  requestLoan,
  transferSend,
  withdraw,
} from "../controllers/transactionController";
import { verifyToken } from "./authRoutes";

const router = express.Router();

router.get("/", verifyToken, getTransactions);
router.get("/:transactionID", verifyToken, getTransactionInfo);
router.post("/deposit", verifyToken, deposit);
router.post("/withdraw", verifyToken, withdraw);
router.post("/requestLoan", verifyToken, requestLoan);
router.post("/paybackLoan", verifyToken, paybackLoan);
router.post("/transfer/send", verifyToken, transferSend);

export default router;
