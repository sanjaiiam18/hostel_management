import mongoose, { Schema, Document } from "mongoose";

export interface IFloor extends Document {
  floorNumber: number;
  name: string;
  hostelId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const FloorSchema = new Schema<IFloor>(
  {
    floorNumber: { type: Number, required: true },
    name: { type: String, required: true, trim: true },
    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },
    blockId: {
      type: Schema.Types.ObjectId,
      ref: "Block",
      required: true,
      index: true,
    },
  },
  { timestamps: true }
);

FloorSchema.index({ blockId: 1, floorNumber: 1 }, { unique: true });

export const Floor =
  mongoose.models.Floor || mongoose.model<IFloor>("Floor", FloorSchema);
export default Floor;
