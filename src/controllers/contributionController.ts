import { Request, Response } from "express";
import Contribution from "../models/Contribution";
import Campaign from "../models/Campaign";

// POST /api/contributions — create a contribution
export const createContribution = async (req: Request, res: Response) => {
  try {
    const {
      campaign_id,
      campaign_title,
      Contribution_amount,
      Supporter_email,
      Supporter_name,
      creator_name,
      creator_email,
    } = req.body;

    if (!campaign_id || !Contribution_amount || !Supporter_email) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const campaign = await Campaign.findById(campaign_id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    const contribution = await Contribution.create({
      campaign_id,
      campaign_title: campaign_title || campaign.campaign_title,
      Contribution_amount,
      Supporter_email,
      Supporter_name: Supporter_name || "Anonymous",
      creator_name: creator_name || campaign.creator_name,
      creator_email: creator_email || campaign.creator_email,
      current_date: new Date(),
    });

    // Update amount_raised on the campaign
    campaign.amount_raised += Contribution_amount;
    if (campaign.amount_raised >= campaign.funding_goal) {
      campaign.status = "funded";
    }
    await campaign.save();

    res.status(201).json(contribution);
  } catch {
    res.status(500).json({ message: "Failed to create contribution." });
  }
};

// GET /api/contributions/:campaignId — get contributions for a campaign
export const getContributionsByCampaign = async (req: Request, res: Response) => {
  try {
    const contributions = await Contribution.find({
      campaign_id: req.params.campaignId,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(contributions);
  } catch {
    res.status(500).json({ message: "Failed to fetch contributions." });
  }
};
