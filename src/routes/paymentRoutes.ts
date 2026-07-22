import { Router } from "express";
import {
  createPayment,
  getPaymentsBySupporter,
  getPaymentStats,
} from "../controllers/paymentController";

const router = Router();

router.post("/", createPayment);
router.get("/stats", getPaymentStats);
router.get("/supporter/:email", getPaymentsBySupporter);

export default router;
