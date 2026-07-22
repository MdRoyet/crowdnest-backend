import { Router } from "express";
import {
  getCampaigns,
  getCampaignById,
  createCampaign,
  getCampaignsByCreator,
  getCreatorStats,
} from "../controllers/campaignController";

const router = Router();

router.get("/", getCampaigns);
router.post("/", createCampaign);
router.get("/creator/:email/stats", getCreatorStats);
router.get("/creator/:email", getCampaignsByCreator);
router.get("/:id", getCampaignById);

export default router;
