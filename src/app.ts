import express, { Application, Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import authRoutes from './routes/authRoutes';



const app: Application = express();

// Middlewares
app.use(
  cors({
    origin: process.env.CLIENT_URL || "http://localhost:3000",
    credentials: true,
  }),
);
app.use(express.json());
app.use(cookieParser());

// Basic Health Route
app.get("/", (req: Request, res: Response) => {
  res.send("Crowdfunding API is running...");
});

app.use('/api/auth', authRoutes);

export default app;
