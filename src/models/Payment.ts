import mongoose, { Document, Schema } from "mongoose";

export interface IPayment extends Document {
  supporter_email: string;
  supporter_name: string;
  credits_purchased: number;
  amount_paid: number;
  payment_date: Date;
  status: "completed" | "failed" | "refunded";
}

const PaymentSchema: Schema = new Schema(
  {
    supporter_email: { type: String, required: true, index: true },
    supporter_name: { type: String, default: "" },
    credits_purchased: { type: Number, required: true },
    amount_paid: { type: Number, required: true },
    payment_date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["completed", "failed", "refunded"],
      default: "completed",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IPayment>("Payment", PaymentSchema);
