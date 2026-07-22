import mongoose from "mongoose";
import dotenv from "dotenv";
import bcrypt from "bcryptjs";
dotenv.config();

import User from "../models/User";

const ADMIN_EMAIL = "rroyet9@gmail.com";
const ADMIN_PASSWORD = "Admin@12345";
const ADMIN_NAME = "Admin";

async function seed() {
  const uri = process.env.MONGO_URI;
  if (!uri) {
    console.error("MONGO_URI not set");
    process.exit(1);
  }

  await mongoose.connect(uri);
  console.log("Connected to MongoDB");

  const existing = await User.findOne({ email: ADMIN_EMAIL });
  if (existing) {
    console.log(`Admin already exists: ${ADMIN_EMAIL}`);
    await mongoose.disconnect();
    return;
  }

  const hashedPassword = await bcrypt.hash(ADMIN_PASSWORD, 12);

  await User.create({
    name: ADMIN_NAME,
    email: ADMIN_EMAIL,
    password: hashedPassword,
    role: "admin",
    credits: 0,
    photoURL: "https://api.dicebear.com/7.x/avataaars/svg?seed=admin",
  });

  console.log("Admin created successfully!");
  console.log(`Email: ${ADMIN_EMAIL}`);
  console.log(`Password: ${ADMIN_PASSWORD}`);

  await mongoose.disconnect();
  console.log("Done!");
}

seed();
