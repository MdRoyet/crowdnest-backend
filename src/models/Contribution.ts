import mongoose, { Document, Schema } from "mongoose";

export interface IContribution extends Document {
  campaign_id: mongoose.Types.ObjectId;
  campaign_title: string;
  Contribution_amount: number;
  Supporter_email: string;
  Supporter_name: string;
  creator_name: string;
  creator_email: string;
  current_date: Date;
}

const ContributionSchema: Schema = new Schema(
  {
    campaign_id: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    campaign_title: { type: String, required: true },
    Contribution_amount: { type: Number, required: true, min: 1 },
    Supporter_email: { type: String, required: true },
    Supporter_name: { type: String, required: true },
    creator_name: { type: String, required: true },
    creator_email: { type: String, required: true },
    current_date: { type: Date, default: Date.now },
  },
  { timestamps: true },
);

export default mongoose.model<IContribution>(
  "Contribution",
  ContributionSchema,
);
