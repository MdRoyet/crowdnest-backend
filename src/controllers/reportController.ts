import { Request, Response } from "express";
import Report from "../models/Report";
import Campaign from "../models/Campaign";

// POST /api/reports — create a report
export const createReport = async (req: Request, res: Response) => {
  try {
    const { campaign_id, campaign_title, reporter_name, reporter_email, reason } =
      req.body;

    if (!campaign_id || !reason || !reporter_email) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    const report = await Report.create({
      campaign_id,
      campaign_title: campaign_title || "Unknown",
      reporter_name: reporter_name || "Anonymous",
      reporter_email,
      reason,
      date: new Date(),
    });

    res.status(201).json(report);
  } catch {
    res.status(500).json({ message: "Failed to create report." });
  }
};

// GET /api/reports — get all reports (admin)
export const getAllReports = async (_req: Request, res: Response) => {
  try {
    const reports = await Report.find({})
      .sort({ createdAt: -1 })
      .lean();
    res.json(reports);
  } catch {
    res.status(500).json({ message: "Failed to fetch reports." });
  }
};

// PATCH /api/reports/:id/resolve — resolve a report (admin)
export const resolveReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "resolved" },
      { new: true },
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }
    res.json(report);
  } catch {
    res.status(500).json({ message: "Failed to resolve report." });
  }
};

// PATCH /api/reports/:id/dismiss — dismiss a report (admin)
export const dismissReport = async (req: Request, res: Response) => {
  try {
    const report = await Report.findByIdAndUpdate(
      req.params.id,
      { status: "dismissed" },
      { new: true },
    );
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }
    res.json(report);
  } catch {
    res.status(500).json({ message: "Failed to dismiss report." });
  }
};

// DELETE /api/reports/:id/suspend-campaign — suspend campaign from report
export const suspendCampaign = async (req: Request, res: Response) => {
  try {
    const report = await Report.findById(req.params.id);
    if (!report) {
      return res.status(404).json({ message: "Report not found." });
    }

    await Campaign.findByIdAndUpdate(report.campaign_id, {
      status: "rejected",
    });

    report.status = "resolved";
    await report.save();

    res.json({ message: "Campaign suspended." });
  } catch {
    res.status(500).json({ message: "Failed to suspend campaign." });
  }
};
