import { Router } from "express";
import {
  createReport,
  getAllReports,
  resolveReport,
  dismissReport,
  suspendCampaign,
} from "../controllers/reportController";

const router = Router();

router.post("/", createReport);
router.get("/", getAllReports);
router.patch("/:id/resolve", resolveReport);
router.patch("/:id/dismiss", dismissReport);
router.delete("/:id/suspend-campaign", suspendCampaign);

export default router;
