import mongoose, { Schema, Document } from "mongoose";

export interface IHostel extends Document {
  name: string;
  code: string;
  type: "boys" | "girls" | "co-ed";
  wardenName: string;
  wardenContact: string;
  totalCapacity: number;
  description?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const HostelSchema = new Schema<IHostel>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    type: { type: String, enum: ["boys", "girls", "co-ed"], default: "boys" },
    wardenName: { type: String, required: true, trim: true },
    wardenContact: { type: String, required: true, trim: true },
    totalCapacity: { type: Number, default: 0 },
    description: { type: String, trim: true },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const Hostel =
  mongoose.models.Hostel || mongoose.model<IHostel>("Hostel", HostelSchema);
export default Hostel;
