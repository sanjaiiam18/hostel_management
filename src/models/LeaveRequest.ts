import mongoose, { Schema, Document } from "mongoose";

export interface ILeaveRequest extends Document {
  studentId: mongoose.Types.ObjectId;
  leaveType: "Home" | "Medical" | "Personal" | "Other";
  startDate: Date;
  endDate: Date;
  reason: string;
  parentContact: string;
  destination: string;
  status: "Pending" | "Approved" | "Rejected";
  reviewedBy?: mongoose.Types.ObjectId;
  reviewedAt?: Date;
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const LeaveRequestSchema = new Schema<ILeaveRequest>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    leaveType: {
      type: String,
      enum: ["Home", "Medical", "Personal", "Other"],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    reason: { type: String, required: true, trim: true },
    parentContact: { type: String, required: true, trim: true },
    destination: { type: String, required: true, trim: true },
    status: {
      type: String,
      enum: ["Pending", "Approved", "Rejected"],
      default: "Pending",
      index: true,
    },
    reviewedBy: { type: Schema.Types.ObjectId, ref: "User" },
    reviewedAt: { type: Date },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export const LeaveRequest =
  mongoose.models.LeaveRequest ||
  mongoose.model<ILeaveRequest>("LeaveRequest", LeaveRequestSchema);
export default LeaveRequest;
