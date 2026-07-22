import mongoose, { Document, Schema } from "mongoose";

export interface ICampaign extends Document {
  campaign_title: string;
  creator_name: string;
  creator_email: string;
  deadline: Date;
  funding_goal: number;
  amount_raised: number;
  description: string;
  category: string;
  image: string;
  status: "pending" | "approved" | "rejected" | "funded";
  creator_id: mongoose.Types.ObjectId;
}

const CampaignSchema: Schema = new Schema(
  {
    campaign_title: { type: String, required: true, trim: true },
    creator_name: { type: String, required: true },
    creator_email: { type: String, required: true },
    creator_id: { type: Schema.Types.ObjectId, ref: "User" },
    deadline: { type: Date, required: true },
    funding_goal: { type: Number, required: true, min: 1 },
    amount_raised: { type: Number, default: 0 },
    description: { type: String, default: "" },
    category: { type: String, default: "Technology" },
    image: { type: String, default: "" },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected", "funded"],
      default: "approved",
    },
  },
  { timestamps: true },
);

export default mongoose.model<ICampaign>("Campaign", CampaignSchema);
