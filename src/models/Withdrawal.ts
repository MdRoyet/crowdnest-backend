import mongoose, { Document, Schema } from "mongoose";

export interface IWithdrawal extends Document {
  creator_email: string;
  creator_name: string;
  withdrawal_credit: number;
  withdrawal_amount: number;
  payment_system: string;
  account_number: string;
  withdraw_date: Date;
  status: "pending" | "approved" | "rejected";
}

const WithdrawalSchema: Schema = new Schema(
  {
    creator_email: { type: String, required: true, index: true },
    creator_name: { type: String, required: true },
    withdrawal_credit: { type: Number, required: true, min: 200 },
    withdrawal_amount: { type: Number, required: true },
    payment_system: { type: String, required: true },
    account_number: { type: String, required: true },
    withdraw_date: { type: Date, default: Date.now },
    status: {
      type: String,
      enum: ["pending", "approved", "rejected"],
      default: "pending",
    },
  },
  { timestamps: true },
);

export default mongoose.model<IWithdrawal>("Withdrawal", WithdrawalSchema);
