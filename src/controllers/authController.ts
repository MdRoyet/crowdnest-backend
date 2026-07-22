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

function getSecret(): string {
  const JWT_SECRET = process.env.JWT_SECRET;
  if (!JWT_SECRET) {
    throw new Error("JWT_SECRET environment variable is required");
  }
  return JWT_SECRET;
}

const COOKIE_MAX_AGE = 7 * 24 * 60 * 60 * 1000; // 7 days
const BCRYPT_ROUNDS = 12;

function setAuthCookie(res: Response, token: string) {
  res.cookie("token", token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: COOKIE_MAX_AGE,
    path: "/",
  });
}

function generateToken(id: string, email: string, role: string) {
  return jwt.sign({ id, email, role }, getSecret(), { expiresIn: "7d" });
}

function verifyToken(token: string) {
  return jwt.verify(token, getSecret()) as jwt.JwtPayload & {
    id: string;
    email: string;
    role: string;
  };
}

function userResponse(user: any) {
  return {
    _id: user._id,
    name: user.name,
    email: user.email,
    photoURL: user.photoURL,
    role: user.role,
    credits: user.credits,
  };
}

// GET /api/auth/me
export const getMe = async (req: Request, res: Response) => {
  try {
    const token = req.cookies.token;
    if (!token) {
      return res.status(401).json({ message: "Not authenticated." });
    }

    const decoded = verifyToken(token);
    const user = await User.findById(decoded.id).select("-password");
    if (!user) {
      return res.status(401).json({ message: "User not found." });
    }

    res.status(200).json(userResponse(user));
  } catch {
    return res.status(401).json({ message: "Invalid or expired token." });
  }
};

// POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token");

    const { name, email, password, photoURL } = req.body;

    // Input validation
    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email, and password are required." });
    }

    if (typeof name !== "string" || name.trim().length < 2 || name.length > 50) {
      return res.status(400).json({ message: "Name must be 2-50 characters." });
    }

    if (typeof email !== "string" || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return res.status(400).json({ message: "Invalid email format." });
    }

    if (typeof password !== "string" || password.length < 6) {
      return res.status(400).json({ message: "Password must be at least 6 characters." });
    }

    if (password.length > 128) {
      return res.status(400).json({ message: "Password is too long." });
    }

    const userExists = await User.findOne({ email: email.toLowerCase() });
    if (userExists) {
      if (!userExists.password) {
        return res.status(400).json({ message: "This email is already registered via Google. Please sign in with Google." });
      }
      return res.status(400).json({ message: "An account with this email already exists. Please log in instead." });
    }

    const hashedPassword = await bcrypt.hash(password, BCRYPT_ROUNDS);

    const user = await User.create({
      name: name.trim(),
      email: email.toLowerCase(),
      password: hashedPassword,
      photoURL: photoURL || "https://api.dicebear.com/7.x/avataaars/svg?seed=crowdnest",
      role: "supporter", // Always default — never trust client-sent role
    });

    const token = generateToken(user._id.toString(), user.email, user.role);
    setAuthCookie(res, token);

    console.log("New user created:", user._id, user.email);
    res.status(201).json(userResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Server Error during registration." });
  }
};

// POST /api/auth/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ message: "Email and password are required." });
    }

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

    res.status(200).json(userResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Server Error during login." });
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

    res.status(200).json(userResponse(user));
  } catch (error) {
    res.status(500).json({ message: "Google authentication failed." });
  }
};

// POST /api/auth/logout
export const logoutUser = async (_req: Request, res: Response) => {
  res.clearCookie("token");
  res.status(200).json({ message: "Logged out." });
};
