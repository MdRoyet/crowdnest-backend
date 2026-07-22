import mongoose, { Document, Schema } from "mongoose";

export interface IReport extends Document {
  campaign_id: mongoose.Types.ObjectId;
  campaign_title: string;
  reporter_name: string;
  reporter_email: string;
  reason: string;
  date: Date;
  status: "pending" | "resolved" | "dismissed";
}

const ReportSchema: Schema = new Schema(
  {
    campaign_id: {
      type: Schema.Types.ObjectId,
      ref: "Campaign",
      required: true,
    },
    campaign_title: { type: String, required: true },
    reporter_name: { type: String, required: true },
    reporter_email: { type: String, required: true },
    reason: { type: String, required: true },
    date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "resolved", "dismissed"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IReport>("Report", ReportSchema);
