import { Request, Response } from "express";
import Payment from "../models/Payment";
import User from "../models/User";

// POST /api/payments — process a credit purchase (dummy payment)
export const createPayment = async (req: Request, res: Response) => {
  try {
    const { supporter_email, supporter_name, credits_purchased, amount_paid } =
      req.body;

    if (!supporter_email || !credits_purchased || !amount_paid) {
      return res.status(400).json({ message: "Missing required fields." });
    }

    // Save payment record
    const payment = await Payment.create({
      supporter_email,
      supporter_name: supporter_name || "",
      credits_purchased,
      amount_paid,
      payment_date: new Date(),
      status: "completed",
    });

    // Add credits to supporter
    const user = await User.findOne({ email: supporter_email });
    if (user) {
      user.credits += credits_purchased;
      await user.save();
    }

    res.status(201).json(payment);
  } catch {
    res.status(500).json({ message: "Failed to process payment." });
  }
};

// GET /api/payments/supporter/:email — get payment history for a supporter
export const getPaymentsBySupporter = async (req: Request, res: Response) => {
  try {
    const payments = await Payment.find({
      supporter_email: req.params.email,
    })
      .sort({ createdAt: -1 })
      .lean();
    res.json(payments);
  } catch {
    res.status(500).json({ message: "Failed to fetch payments." });
  }
};

// GET /api/payments/stats — admin stats
export const getPaymentStats = async (_req: Request, res: Response) => {
  try {
    const totalPayments = await Payment.countDocuments({ status: "completed" });
    const totalRevenue = await Payment.aggregate([
      { $match: { status: "completed" } },
      { $group: { _id: null, total: { $sum: "$amount_paid" } } },
    ]);

    res.json({
      totalPayments,
      totalRevenue: totalRevenue[0]?.total || 0,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};
