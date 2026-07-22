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
    password: { type: String, required: false },
    photoURL: {
      type: String,
      default: "https://api.dicebear.com/7.x/avataaars/svg?seed=crowdnest",
    },
    role: {
      type: String,
      enum: ["admin", "creator", "supporter"],
      default: "supporter",
    },
    credits: { type: Number, default: 50 },
  },
  { timestamps: true },
);

UserSchema.pre("save", function () {
  if (this.isNew) {
    if (this.role === "creator") {
      this.credits = 20;
    } else if (this.role === "supporter") {
      this.credits = 50;
    }
  }
});

export default mongoose.model<IUser>("User", UserSchema);
