import { Router } from "express";
import { registerUser, loginUser, googleLogin, getMe, logoutUser } from "../controllers/authController";

const router = Router();

router.get("/me", getMe);
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/google", googleLogin);
router.post("/logout", logoutUser);

export default router;
