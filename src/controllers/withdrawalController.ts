import { Request, Response } from "express";
import Withdrawal from "../models/Withdrawal";
import Campaign from "../models/Campaign";
import User from "../models/User";
import { createNotification } from "./notificationController";
import { sendEmail, withdrawalApprovedEmail } from "../utils/emailSender";

// POST /api/withdrawals — create a withdrawal request
export const createWithdrawal = async (req: Request, res: Response) => {
  try {
    const {
      creator_email,
      creator_name,
      withdrawal_credit,
      payment_system,
      account_number,
    } = req.body;

    if (!creator_email || !withdrawal_credit || !payment_system || !account_number) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    if (withdrawal_credit < 200) {
      return res
        .status(400)
        .json({ message: "Minimum withdrawal is 200 credits ($10)." });
    }

    // Check creator has enough raised credits
    const campaigns = await Campaign.find({ creator_email });
    const totalRaised = campaigns.reduce((sum, c) => sum + c.amount_raised, 0);

    // Check how much was already withdrawn
    const previousWithdrawals = await Withdrawal.find({
      creator_email,
      status: { $in: ["pending", "approved"] },
    });
    const alreadyWithdrawn = previousWithdrawals.reduce(
      (sum, w) => sum + w.withdrawal_credit,
      0,
    );

    const available = totalRaised - alreadyWithdrawn;
    if (withdrawal_credit > available) {
      return res.status(400).json({
        message: `Insufficient credits. Available: ${available} credits.`,
      });
    }

    const withdrawal_amount = withdrawal_credit / 20; // 20 credits = $1

    const withdrawal = await Withdrawal.create({
      creator_email,
      creator_name: creator_name || "Unknown",
      withdrawal_credit,
      withdrawal_amount,
      payment_system,
      account_number,
      withdraw_date: new Date(),
      status: "pending",
    });

    res.status(201).json(withdrawal);
  } catch {
    res.status(500).json({ message: "Failed to create withdrawal request." });
  }
};

// GET /api/withdrawals/creator/:email — get creator's withdrawal history
export const getWithdrawalsByCreator = async (req: Request, res: Response) => {
  try {
    const withdrawals = await Withdrawal.find({
      creator_email: req.params.email,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(withdrawals);
  } catch {
    res.status(500).json({ message: "Failed to fetch withdrawals." });
  }
};

// GET /api/withdrawals/pending — get all pending withdrawals (admin)
export const getPendingWithdrawals = async (_req: Request, res: Response) => {
  try {
    const withdrawals = await Withdrawal.find({ status: "pending" })
      .sort({ createdAt: -1 })
      .lean();
    res.json(withdrawals);
  } catch {
    res.status(500).json({ message: "Failed to fetch withdrawals." });
  }
};

// PATCH /api/withdrawals/:id/approve — approve withdrawal (admin)
export const approveWithdrawal = async (req: Request, res: Response) => {
  try {
    const withdrawal = await Withdrawal.findById(req.params.id);
    if (!withdrawal) {
      return res.status(404).json({ message: "Withdrawal not found." });
    }
    if (withdrawal.status !== "pending") {
      return res.status(400).json({ message: "Already processed." });
    }

    withdrawal.status = "approved";
    await withdrawal.save();

    // Decrease creator's raised credits
    const campaigns = await Campaign.find({
      creator_email: withdrawal.creator_email,
    });
    let remaining = withdrawal.withdrawal_credit;
    for (const c of campaigns) {
      if (remaining <= 0) break;
      const deduct = Math.min(c.amount_raised, remaining);
      c.amount_raised -= deduct;
      remaining -= deduct;
      await c.save();
    }

    // Notify creator
    await createNotification(
      `Your withdrawal of ${withdrawal.withdrawal_credit} credits ($${withdrawal.withdrawal_amount}) has been approved.`,
      withdrawal.creator_email,
      "/dashboard/creator/withdrawals",
    );

    // Email creator
    const email = withdrawalApprovedEmail(
      withdrawal.creator_name,
      withdrawal.withdrawal_credit,
      withdrawal.withdrawal_amount,
    );
    sendEmail({ to: withdrawal.creator_email, ...email });

    res.json(withdrawal);
  } catch {
    res.status(500).json({ message: "Failed to approve withdrawal." });
  }
};
