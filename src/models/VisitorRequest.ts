import mongoose, { Schema, Document } from "mongoose";

export interface IVisitorRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  visitorName: string;
  relationship: string;
  phoneNumber: string;
  visitDate: Date;
  expectedEntryTime: string;
  expectedExitTime: string;
  actualEntryTime?: string;
  actualExitTime?: string;
  purpose: string;
  status: "Pending" | "Approved" | "Rejected" | "Checked In" | "Checked Out";
  reviewedBy?: mongoose.Types.ObjectId;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const VisitorRequestSchema = new Schema<IVisitorRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    visitorName: { type: String, required: true, trim: true },
    relationship: { type: String, required: true, trim: true },
    phoneNumber: { type: String, required: true, trim: true },
    visitDate: { type: Date, required: true, index: true },
    expectedEntryTime: { type: String, required: true, trim: true },
    expectedExitTime: { type: String, required: true, trim: true },
    actualEntryTime: { type: String, trim: true },
    actualExitTime: { type: String, trim: true },
    purpose: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected", "Checked In", "Checked Out"],
      default: "Pending",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export const VisitorRequest =
  mongoose.models.VisitorRequest ||
  mongoose.model<IVisitorRequest>("VisitorRequest", VisitorRequestSchema);
export default VisitorRequest;
