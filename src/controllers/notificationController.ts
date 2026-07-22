import { Request, Response } from "express";
import Notification from "../models/Notification";

// GET /api/notifications/:email — get notifications for a user
export const getNotifications = async (req: Request, res: Response) => {
  try {
    const notifications = await Notification.find({
      toEmail: req.params.email,
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(notifications);
  } catch {
    res.status(500).json({ message: "Failed to fetch notifications." });
  }
};

// PATCH /api/notifications/:id/read — mark as read
export const markAsRead = async (req: Request, res: Response) => {
  try {
    await Notification.findByIdAndUpdate(req.params.id, { read: true });
    res.json({ message: "Marked as read." });
  } catch {
    res.status(500).json({ message: "Failed to update notification." });
  }
};

// Helper — create a notification (used by other controllers)
export const createNotification = async (
  message: string,
  toEmail: string,
  actionRoute: string = "/",
) => {
  try {
    await Notification.create({ message, toEmail, actionRoute, time: new Date() });
  } catch {
    // silently fail — notifications are non-critical
  }
};
