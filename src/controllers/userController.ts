import { Request, Response } from "express";
import User from "../models/User";

// GET /api/users — get all users (admin)
export const getAllUsers = async (_req: Request, res: Response) => {
  try {
    const users = await User.find({})
      .select("-password")
      .sort({ createdAt: -1 })
      .lean();
    res.json(users);
  } catch {
    res.status(500).json({ message: "Failed to fetch users." });
  }
};

// GET /api/users/stats — admin stats
export const getAdminStats = async (_req: Request, res: Response) => {
  try {
    const [totalSupporters, totalCreators, totalAdmins, creditSum] =
      await Promise.all([
        User.countDocuments({ role: "supporter" }),
        User.countDocuments({ role: "creator" }),
        User.countDocuments({ role: "admin" }),
        User.aggregate([
          { $group: { _id: null, total: { $sum: "$credits" } } },
        ]),
      ]);

    res.json({
      totalSupporters,
      totalCreators,
      totalAdmins,
      totalUsers: totalSupporters + totalCreators + totalAdmins,
      totalCredits: creditSum[0]?.total || 0,
    });
  } catch {
    res.status(500).json({ message: "Failed to fetch stats." });
  }
};

// PATCH /api/users/:id/role — update user role (admin)
export const updateUserRole = async (req: Request, res: Response) => {
  try {
    const { role } = req.body;
    if (!["admin", "creator", "supporter"].includes(role)) {
      return res.status(400).json({ message: "Invalid role." });
    }

    const user = await User.findByIdAndUpdate(
      req.params.id,
      { role },
      { new: true },
    ).select("-password");

    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }

    res.json(user);
  } catch {
    res.status(500).json({ message: "Failed to update role." });
  }
};

// DELETE /api/users/:id — delete user (admin)
export const deleteUser = async (req: Request, res: Response) => {
  try {
    const user = await User.findByIdAndDelete(req.params.id);
    if (!user) {
      return res.status(404).json({ message: "User not found." });
    }
    res.json({ message: "User deleted." });
  } catch {
    res.status(500).json({ message: "Failed to delete user." });
  }
};
