import mongoose, { Schema, Document } from "mongoose";

export interface IPaymentRecord extends Document {
  feeRecordId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  amount: number;
  paymentMethod: "Simulation" | "Cash" | "Bank Transfer" | "Online";
  transactionReference: string;
  paymentDate: Date;
  isVerified: boolean;
  notes?: string;
  recordedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const PaymentRecordSchema = new Schema<IPaymentRecord>(
  {
    feeRecordId: {
      type: Schema.Types.ObjectId,
      ref: "FeeRecord",
      required: true,
      index: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    amount: { type: Number, required: true, min: 1 },
    paymentMethod: {
      type: String,
      enum: ["Simulation", "Cash", "Bank Transfer", "Online"],
      default: "Simulation",
    },
    transactionReference: {
      type: String,
      required: true,
      unique: true,
      trim: true,
    },
    paymentDate: { type: Date, default: Date.now },
    isVerified: { type: Boolean, default: true },
    notes: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

export const PaymentRecord =
  mongoose.models.PaymentRecord ||
  mongoose.model<IPaymentRecord>("PaymentRecord", PaymentRecordSchema);
export default PaymentRecord;
