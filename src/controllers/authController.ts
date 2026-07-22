import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { initializeApp, cert, getApps } from "firebase-admin/app";
import { getAuth } from "firebase-admin/auth";
import User from "../models/User";

// Lazy-init Firebase Admin (env vars available after dotenv.config())
function getFirebaseAuth() {
  if (!getApps().length) {
    initializeApp({
      credential: cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
      }),
    });
  }
  return getAuth();
}

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days

function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
  });
}

function generateToken(id: string, email: string, role: string) {
  return jwt.sign({ id, email, role }, process.env.JWT_SECRET || "fallback_secret", {
    expiresIn: "7d",
  });
}

function userResponse(user: any, token: string) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    role: user.role,
    credits: user.credits,
    token,
  };
}

// GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET || "fallback_secret") as {
      id: string;
      email: string;
      role: string;
    };

    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
      credits: user.credits,
    });
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    // Clear any stale session cookie
    res.clearCookie("token");

    const { name, email, password, photoURL, role } = req.body;
    console.log("Register attempt:", { name, email });

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      if (!userExists.password) {
        return res.status(400).json({ message: "This email is already registered via Google. Please sign in with Google." });
      }
      return res.status(400).json({ message: "An account with this email already exists. Please log in instead." });
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email: email.toLowerCase(),
      password: hashedPassword,
      photoURL: photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=crowdnest",
      role: role || "supporter",
    });

    const token = generateToken(user._id.toString(), user.email, user.role);

    console.log("New user created:", user._id, user.email);
    res.status(201).json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: "Server Error during registration.", error });
  }
};

// POST /api/auth/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email: email.toLowerCase() });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    if (!user.password) {
      return res.status(401).json({ message: "This account uses Google sign-in. Please sign in with Google, or register with email to set a password." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    setAuthCookie(res, token);

    res.status(200).json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: "Server Error during login.", error });
  }
};

// POST /api/auth/google
export const googleLogin = async (req: Request, res: Response) => {
  try {
    const { idToken } = req.body;
    if (!idToken) {
      return res.status(400).json({ message: "Google ID token is required." });
    }

    const decodedToken = await getFirebaseAuth().verifyIdToken(idToken);

    const email = decodedToken.email?.toLowerCase();
    if (!email) {
      return res.status(401).json({ message: "Google account has no email." });
    }

    const name = decodedToken.name || decodedToken.email?.split("@")[0] || "Google User";
    const picture = decodedToken.picture;

    let user = await User.findOne({ email });

    if (!user) {
      user = await User.create({
        name,
        email,
        photoURL: picture || "https://api.dicebear.com/7.x/avataaars/svg?seed=crowdnest",
        role: "supporter",
      });
    }

    const token = generateToken(user._id.toString(), user.email, user.role);
    setAuthCookie(res, token);

    res.status(200).json(userResponse(user, token));
  } catch (error) {
    res.status(500).json({ message: "Google authentication failed.", error });
  }
};

// POST /api/auth/logout
export const logoutUser = async (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out." });
};
