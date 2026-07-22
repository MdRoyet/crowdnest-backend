import { Request, Response } from "express";
import Campaign from "../models/Campaign";
import { createNotification } from "./notificationController";

// GET /api/campaigns — public, all approved campaigns
export const getCampaigns = async (req: Request, res: Response) => {
  try {
    const { category, search, page = "1", limit = "12" } = req.query;
    const filter: Record<string, unknown> = { status: "approved" };

    if (category && category !== "All") {
      filter.category = category;
    }
    if (search) {
      filter.campaign_title = { $regex: search, $options: "i" };
    }

    const pageNum = parseInt(page as string, 10);
    const limitNum = parseInt(limit as string, 10);
    const skip = (pageNum - 1) * limitNum;

    const [campaigns, total] = await Promise.all([
      Campaign.find(filter)
        .sort({ createdAt: -1 })
        .skip(skip)
        .limit(limitNum)
        .lean(),
      Campaign.countDocuments(filter),
    ]);

    res.json({
      campaigns,
      total,
      page: pageNum,
      pages: Math.ceil(total / limitNum),
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch campaigns." });
  }
};

// GET /api/campaigns/:id — public
export const getCampaignById = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id).lean();
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }
    res.json(campaign);
  } catch {
    res.status(500).json({ message: "Failed to fetch campaign." });
  }
};

// POST /api/campaigns — create a campaign (status = pending)
export const createCampaign = async (req: Request, res: Response) => {
  try {
    const {
      campaign_title,
      campaign_story,
      category,
      funding_goal,
      minimum_contribution,
      deadline,
      reward_info,
      campaign_image_url,
      creator_name,
      creator_email,
      creator_id,
    } = req.body;

    if (!campaign_title || !funding_goal || !deadline || !creator_email) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const campaign = await Campaign.create({
      campaign_title,
      campaign_story: campaign_story || "",
      description: campaign_story || "",
      category: category || "Technology",
      funding_goal,
      minimum_contribution: minimum_contribution || 1,
      deadline: new Date(deadline),
      reward_info: reward_info || "",
      image: campaign_image_url || "",
      creator_name: creator_name || "Unknown",
      creator_email,
      creator_id: creator_id || undefined,
      status: "pending",
    });

    res.status(201).json(campaign);
  } catch {
    res.status(500).json({ message: "Failed to create campaign." });
  }
};

// GET /api/campaigns/creator/:email — get all campaigns by a creator
export const getCampaignsByCreator = async (req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find({
      creator_email: req.params.email,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(campaigns);
  } catch {
    res.status(500).json({ message: "Failed to fetch campaigns." });
  }
};

// GET /api/campaigns/creator/:email/stats — get creator stats
export const getCreatorStats = async (req: Request, res: Response) => {
  try {
    const email = req.params.email;
    const campaigns = await Campaign.find({ creator_email: email }).lean();

    const totalCampaigns = campaigns.length;
    const activeCampaigns = campaigns.filter(
      (c) =>
        (c.status === "approved" || c.status === "funded") &&
        new Date(c.deadline) > new Date(),
    ).length;
    const totalRaised = campaigns.reduce((sum, c) => sum + c.amount_raised, 0);

    res.json({
      totalCampaigns,
      activeCampaigns,
      totalRaised,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

// GET /api/campaigns/pending — get all pending campaigns (admin)
export const getPendingCampaigns = async (_req: Request, res: Response) => {
  try {
    const campaigns = await Campaign.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();
    res.json(campaigns);
  } catch {
    res.status(500).json({ message: "Failed to fetch campaigns." });
  }
};

// PATCH /api/campaigns/:id/approve — approve campaign (admin)
export const approveCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    campaign.status = "approved";
    await campaign.save();

    await createNotification(
      `Your campaign "${campaign.campaign_title}" has been approved and is now live!`,
      campaign.creator_email,
      "/dashboard/creator/my-campaigns",
    );

    res.json(campaign);
  } catch {
    res.status(500).json({ message: "Failed to approve campaign." });
  }
};

// PATCH /api/campaigns/:id/reject — reject campaign (admin)
export const rejectCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    campaign.status = "rejected";
    await campaign.save();

    await createNotification(
      `Your campaign "${campaign.campaign_title}" has been rejected. Please review the guidelines and resubmit.`,
      campaign.creator_email,
      "/dashboard/creator/my-campaigns",
    );

    res.json(campaign);
  } catch {
    res.status(500).json({ message: "Failed to reject campaign." });
  }
};

// DELETE /api/campaigns/:id — delete campaign
export const deleteCampaign = async (req: Request, res: Response) => {
  try {
    const campaign = await Campaign.findByIdAndDelete(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }
    res.json({ message: "Campaign deleted." });
  } catch {
    res.status(500).json({ message: "Failed to delete campaign." });
  }
};

// PUT /api/campaigns/:id — update campaign
export const updateCampaign = async (req: Request, res: Response) => {
  try {
    const { campaign_title, campaign_story, reward_info } = req.body;
    const campaign = await Campaign.findById(req.params.id);
    if (!campaign) {
      return res.status(404).json({ message: "Campaign not found." });
    }

    if (campaign_title !== undefined) campaign.campaign_title = campaign_title;
    if (campaign_story !== undefined) {
      campaign.campaign_story = campaign_story;
      campaign.description = campaign_story;
    }
    if (reward_info !== undefined) campaign.reward_info = reward_info;

    await campaign.save();
    res.json(campaign);
  } catch {
    res.status(500).json({ message: "Failed to update campaign." });
  }
};
