import express, { Application, Request, Response } from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import authRoutes from "./routes/authRoutes";
import campaignRoutes from "./routes/campaignRoutes";
import contributionRoutes from "./routes/contributionRoutes";

const app: Application = express();

// Security headers
app.use(helmet());

// Body size limit (100kb)
app.use(express.json({ limit: "100kb" }));

// CORS
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);

app.use(cookieParser());

// Rate limiting — general (100 requests per 15 min per IP)
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 100,
    standardHeaders: true,
    legacyHeaders: false,
    message: { message: "Too many requests, please try again later." },
  }),
);

// Stricter rate limit for auth endpoints (10 requests per 15 min)
const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 10,
  standardHeaders: true,
  legacyHeaders: false,
  message: { message: "Too many auth attempts, please try again later." },
});

// Basic Health Route
app.get("/", (_req: Request, res: Response) => {
  res.send("Crowdfunding API is running...");
});

app.use("/api/auth", authLimiter, authRoutes);
app.use("/api/campaigns", campaignRoutes);
app.use("/api/contributions", contributionRoutes);

export default app;
