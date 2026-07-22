import { Router } from "express";
import {
  getAllUsers,
  getAdminStats,
  updateUserRole,
  deleteUser,
} from "../controllers/userController";

const router = Router();

router.get("/", getAllUsers);
router.get("/stats", getAdminStats);
router.patch("/:id/role", updateUserRole);
router.delete("/:id", deleteUser);

export default router;
