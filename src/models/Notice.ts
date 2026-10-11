import mongoose, { Schema, Document } from "mongoose";

export interface INotice extends Document {
  title: string;
  description: string;
  category:
    | "General"
    | "Academic"
    | "Hostel"
    | "Emergency"
    | "Mess"
    | "Maintenance";
  priority: "Normal" | "Important" | "Emergency";
  publicationDate: Date;
  expirationDate?: Date;
  author: string;
  authorRole?: string;
  status: "Draft" | "Published" | "Archived";
  createdAt: Date;
  updatedAt: Date;
}

const NoticeSchema = new Schema<INotice>(
  {
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "General",
        "Academic",
        "Hostel",
        "Emergency",
        "Mess",
        "Maintenance",
      ],
      default: "Hostel",
      index: true,
    },
    priority: {
      type: String,
      enum: ["Normal", "Important", "Emergency"],
      default: "Normal",
      index: true,
    },
    publicationDate: { type: Date, default: Date.now, index: true },
    expirationDate: { type: Date },
    author: { type: String, required: true, default: "Warden Office" },
    authorRole: { type: String, default: "Admin" },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Published",
      index: true,
    },
  },
  { timestamps: true }
);

export const Notice =
  mongoose.models.Notice || mongoose.model<INotice>("Notice", NoticeSchema);
export default Notice;
