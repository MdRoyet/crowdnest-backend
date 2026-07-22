import { Router } from "express";
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  getCampaignsByCreator,
  getCreatorStats,
  getPendingCampaigns,
  approveCampaign,
  rejectCampaign,
  deleteCampaign,
} from "../controllers/campaignController";

const router = Router();

router.get("/", getCampaigns);
router.post("/", createCampaign);
router.get("/pending", getPendingCampaigns);
router.get("/creator/:email/stats", getCreatorStats);
router.get("/creator/:email", getCampaignsByCreator);
router.get("/:id", getCampaignById);
router.patch("/:id/approve", approveCampaign);
router.patch("/:id/reject", rejectCampaign);
router.delete("/:id", deleteCampaign);

export default router;
