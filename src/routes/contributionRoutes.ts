import { Router } from "express";
import {
  createContribution,
  getContributionsByCampaign,
  getContributionsBySupporter,
  getContributionsByCreator,
  getPendingContributions,
  approveContribution,
  rejectContribution,
} from "../controllers/contributionController";

const router = Router();

router.post("/", createContribution);
router.get("/pending/:creatorEmail", getPendingContributions);
router.get("/supporter/:email", getContributionsBySupporter);
router.get("/creator/:email", getContributionsByCreator);
router.patch("/:id/approve", approveContribution);
router.patch("/:id/reject", rejectContribution);
router.get("/:campaignId", getContributionsByCampaign);

export default router;
