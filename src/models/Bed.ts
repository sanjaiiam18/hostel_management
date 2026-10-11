import mongoose, { Schema, Document } from "mongoose";

export interface IBed extends Document {
  bedNumber: string;
  roomId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  floorId: mongoose.Types.ObjectId;
  isOccupied: boolean;
  currentStudentId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const BedSchema = new Schema<IBed>(
  {
    bedNumber: { type: String, required: true, trim: true },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
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
    floorId: {
      type: Schema.Types.ObjectId,
      ref: "Floor",
      required: true,
      index: true,
    },
    isOccupied: { type: Boolean, default: false, index: true },
    currentStudentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      sparse: true,
      index: true,
    },
  },
  { timestamps: true }
);

BedSchema.index({ roomId: 1, bedNumber: 1 }, { unique: true });

export const Bed =
  mongoose.models.Bed || mongoose.model<IBed>("Bed", BedSchema);
export default Bed;
