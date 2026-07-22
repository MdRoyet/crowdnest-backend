import { Router } from "express";
import {
  createContribution,
  getContributionsByCampaign,
} from "../controllers/contributionController";

const router = Router();

router.post("/", createContribution);
router.get("/:campaignId", getContributionsByCampaign);

export default router;
