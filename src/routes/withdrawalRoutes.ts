import { Router } from "express";
import {
  createWithdrawal,
  getWithdrawalsByCreator,
  getPendingWithdrawals,
  approveWithdrawal,
} from "../controllers/withdrawalController";

const router = Router();

router.post("/", createWithdrawal);
router.get("/pending", getPendingWithdrawals);
router.get("/creator/:email", getWithdrawalsByCreator);
router.patch("/:id/approve", approveWithdrawal);

export default router;
