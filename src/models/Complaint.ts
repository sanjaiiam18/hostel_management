import mongoose, { Schema, Document } from "mongoose";

export interface IComplaint extends Document {
  studentId: mongoose.Types.ObjectId;
  category:
    | "Electrical"
    | "Plumbing"
    | "Food"
    | "Room"
    | "Cleaning"
    | "Wi-Fi"
    | "Security"
    | "Other";
  subject: string;
  description: string;
  priority: "Low" | "Medium" | "High" | "Urgent";
  status: "Submitted" | "Under Review" | "In Progress" | "Resolved" | "Rejected";
  attachmentUrl?: string;
  assignedTo?: string;
  resolutionNotes?: string;
  resolvedAt?: Date;
  reviewedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const ComplaintSchema = new Schema<IComplaint>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    category: {
      type: String,
      enum: [
        "Electrical",
        "Plumbing",
        "Food",
        "Room",
        "Cleaning",
        "Wi-Fi",
        "Security",
        "Other",
      ],
      required: true,
      index: true,
    },
    subject: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true },
    priority: {
      type: String,
      enum: ["Low", "Medium", "High", "Urgent"],
      default: "Medium",
      index: true,
    },
    status: {
      type: String,
      enum: [
        "Submitted",
        "Under Review",
        "In Progress",
        "Resolved",
        "Rejected",
      ],
      default: "Submitted",
      index: true,
    },
    attachmentUrl: { type: String },
    assignedTo: { type: String, trim: true },
    resolutionNotes: { type: String, trim: true },
    resolvedAt: { type: Date },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const Complaint =
  mongoose.models.Complaint ||
  mongoose.model<IComplaint>("Complaint", ComplaintSchema);
export default Complaint;
