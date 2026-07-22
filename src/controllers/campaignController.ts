import { Request, Response } from "express";
import Campaign from "../models/Campaign";

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
