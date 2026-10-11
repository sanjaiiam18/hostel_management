import mongoose, { Schema, Document } from "mongoose";

export interface IFeeRecord extends Document {
  studentId: mongoose.Types.ObjectId;
  title: string;
  academicYear: string;
  semester?: string;
  totalAmount: number;
  paidAmount: number;
  outstandingAmount: number;
  dueDate: Date;
  status: "Paid" | "Partially Paid" | "Pending" | "Overdue";
  remarks?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FeeRecordSchema = new Schema<IFeeRecord>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    semester: { type: String, trim: true },
    totalAmount: { type: Number, required: true, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    outstandingAmount: { type: Number, required: true, min: 0 },
    dueDate: { type: Date, required: true, index: true },
    status: {
      type: String,
      enum: ["Paid", "Partially Paid", "Pending", "Overdue"],
      default: "Pending",
      index: true,
    },
    remarks: { type: String, trim: true },
  },
  { timestamps: true }
);

export const FeeRecord =
  mongoose.models.FeeRecord ||
  mongoose.model<IFeeRecord>("FeeRecord", FeeRecordSchema);
export default FeeRecord;
