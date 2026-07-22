import { Router } from "express";
import { getNotifications, markAsRead } from "../controllers/notificationController";

const router = Router();

router.get("/:email", getNotifications);
router.patch("/:id/read", markAsRead);

export default router;
