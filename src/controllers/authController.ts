import { Request, Response } from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import User from "../models/User";

// Generate JWT Token
const generateToken = (id: string, email: string, role: string) => {
  return jwt.sign(
    { id, email, role },
    process.env.JWT_SECRET || "fallback_secret",
    {
      expiresIn: "7d",
    },
  );
};

// POST /api/auth/register
export const registerUser = async (req: Request, res: Response) => {
  try {
    const { name, email, password, photoURL, role } = req.body;

    const userExists = await User.findOne({ email });
    if (userExists) {
      return res
        .status(400)
        .json({ message: "User already exists with this email." });
    }

    // Hash password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      photoURL: photoURL || "https://i.ibb.co/2k5z4jN/default-avatar.png",
      role: role || "supporter",
    });

    if (user) {
      res.status(201).json({
        _id: user._id,
        name: user.name,
        email: user.email,
        photoURL: user.photoURL,
        role: user.role,
        credits: user.credits,
        token: generateToken(user._id.toString(), user.email, user.role),
      });
    }
  } catch (error) {
    res
      .status(500)
      .json({ message: "Server Error during registration.", error });
  }
};

// POST /api/auth/login
export const loginUser = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });
    if (!user) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    // Check if user registered with Google (no password)
    if (!user.password) {
      return res.status(401).json({ message: "Please log in with Google." });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ message: "Invalid email or password." });
    }

    res.status(200).json({
      _id: user._id,
      name: user.name,
      email: user.email,
      photoURL: user.photoURL,
      role: user.role,
      credits: user.credits,
      token: generateToken(user._id.toString(), user.email, user.role),
    });
  } catch (error) {
    res.status(500).json({ message: "Server Error during login.", error });
  }
};
