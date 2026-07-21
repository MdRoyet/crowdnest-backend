import mongoose, { Document, Schema } from "mongoose";

export interface IUser extends Document {
  name: string;
  email: string;
  password: string;
  photoURL: string;
  role: "admin" | "creator" | "supporter";
  credits: number;
}

const UserSchema: Schema = new Schema(
  {
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: false }, // False for Google OAuth users
    photoURL: {
      type: String,
      default: "https://i.ibb.co/2k5z4jN/default-avatar.png",
    },
    role: {
      type: String,
      enum: ["admin", "creator", "supporter"],
      default: "supporter",
    },
    credits: { type: Number, default: 50 }, // Default for supporter
  },
  { timestamps: true },
);

// Pre-save hook to assign credits based on role
UserSchema.pre<IUser>("save", function (next) {
  if (this.isNew) {
    if (this.role === "creator") {
      this.credits = 20;
    } else if (this.role === "supporter") {
      this.credits = 50;
    }
  }
  next();
});

export default mongoose.model<IUser>("User", UserSchema);
