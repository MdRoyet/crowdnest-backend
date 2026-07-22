import mongoose, { Document, Schema } from "mongoose";

export interface INotification extends Document {
  message: string;
  toEmail: string;
  actionRoute: string;
  time: Date;
  read: boolean;
}

const NotificationSchema: Schema = new Schema(
  {
    message: { type: String, required: true },
    toEmail: { type: String, required: true, index: true },
    actionRoute: { type: String, default: "/" },
    time: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  { timestamps: true },
);

export default mongoose.model<INotification>(
  "Notification",
  NotificationSchema,
);
