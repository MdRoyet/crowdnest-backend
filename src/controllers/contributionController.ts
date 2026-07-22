import { Request, Response } from "express";
import Contribution from "../models/Contribution";
import Campaign from "../models/Campaign";
import User from "../models/User";
import { createNotification } from "./notificationController";
import {
  sendEmail,
  contributionApprovedEmail,
  contributionRejectedEmail,
  newContributionEmail,
} from "../utils/emailSender";

// POST /api/contributions — create a contribution (status = pending)
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
      message,
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
      message: message || "",
      status: "pending",
    });

    // Deduct credits from supporter
    const supporter = await User.findOne({ email: Supporter_email });
    if (supporter) {
      supporter.credits -= Contribution_amount;
      await supporter.save();
    }

    // Notify creator
    await createNotification(
      `New contribution of ${Contribution_amount} credits to "${campaign_title}" from ${Supporter_name}.`,
      creator_email,
      "/dashboard/creator/home",
    );

    // Email creator
    const email = newContributionEmail(
      creator_name,
      Supporter_name,
      campaign_title,
      Contribution_amount,
    );
    sendEmail({ to: creator_email, ...email });

    res.status(201).json(contribution);
  } catch {
    res.status(500).json({ message: "Failed to create contribution." });
  }
};

// GET /api/contributions/pending/:creatorEmail — get all pending contributions for a creator
export const getPendingContributions = async (req: Request, res: Response) => {
  try {
    const contributions = await Contribution.find({
      creator_email: req.params.creatorEmail,
      status: "pending",
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(contributions);
  } catch {
    res.status(500).json({ message: "Failed to fetch contributions." });
  }
};

// PATCH /api/contributions/:id/approve — approve a contribution
export const approveContribution = async (req: Request, res: Response) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found." });
    }
    if (contribution.status !== "pending") {
      return res.status(400).json({ message: "Contribution already processed." });
    }

    contribution.status = "approved";
    await contribution.save();

    // Add amount to campaign's raised
    const campaign = await Campaign.findById(contribution.campaign_id);
    if (campaign) {
      campaign.amount_raised += contribution.Contribution_amount;
      if (campaign.amount_raised >= campaign.funding_goal) {
        campaign.status = "funded";
      }
      await campaign.save();
    }

    // Notify supporter
    await createNotification(
      `Your contribution of ${contribution.Contribution_amount} credits to "${contribution.campaign_title}" was approved by ${contribution.creator_name}.`,
      contribution.Supporter_email,
      "/dashboard/supporter/my-contributions",
    );

    // Email supporter
    const email = contributionApprovedEmail(
      contribution.Supporter_name,
      contribution.campaign_title,
      contribution.Contribution_amount,
      contribution.creator_name,
    );
    sendEmail({ to: contribution.Supporter_email, ...email });

    res.json(contribution);
  } catch {
    res.status(500).json({ message: "Failed to approve contribution." });
  }
};

// PATCH /api/contributions/:id/reject — reject a contribution
export const rejectContribution = async (req: Request, res: Response) => {
  try {
    const contribution = await Contribution.findById(req.params.id);
    if (!contribution) {
      return res.status(404).json({ message: "Contribution not found." });
    }
    if (contribution.status !== "pending") {
      return res.status(400).json({ message: "Contribution already processed." });
    }

    contribution.status = "rejected";
    await contribution.save();

    // Refund credits to supporter
    const supporter = await User.findOne({ email: contribution.Supporter_email });
    if (supporter) {
      supporter.credits += contribution.Contribution_amount;
      await supporter.save();
    }

    // Notify supporter
    await createNotification(
      `Your contribution of ${contribution.Contribution_amount} credits to "${contribution.campaign_title}" was rejected by ${contribution.creator_name}. Credits have been refunded.`,
      contribution.Supporter_email,
      "/dashboard/supporter/my-contributions",
    );

    // Email supporter
    const email = contributionRejectedEmail(
      contribution.Supporter_name,
      contribution.campaign_title,
      contribution.Contribution_amount,
      contribution.creator_name,
    );
    sendEmail({ to: contribution.Supporter_email, ...email });

    res.json(contribution);
  } catch {
    res.status(500).json({ message: "Failed to reject contribution." });
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

// GET /api/contributions/supporter/:email — get all contributions by a supporter
export const getContributionsBySupporter = async (req: Request, res: Response) => {
  try {
    const contributions = await Contribution.find({
      Supporter_email: req.params.email,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(contributions);
  } catch {
    res.status(500).json({ message: "Failed to fetch contributions." });
  }
};

// GET /api/contributions/creator/:email — get all contributions for a creator's campaigns
export const getContributionsByCreator = async (req: Request, res: Response) => {
  try {
    const contributions = await Contribution.find({
      creator_email: req.params.email,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(contributions);
  } catch {
    res.status(500).json({ message: "Failed to fetch contributions." });
  }
};
