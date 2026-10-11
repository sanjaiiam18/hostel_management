import mongoose, { Schema, Document } from "mongoose";

export interface IRoom extends Document {
  roomNumber: string;
  hostelId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  floorId: mongoose.Types.ObjectId;
  roomType: "Single" | "Double" | "Triple" | "Quad";
  totalBeds: number;
  occupiedBeds: number;
  availableBeds: number;
  status: "Available" | "Partially Occupied" | "Full" | "Maintenance";
  facilities: string[];
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const RoomSchema = new Schema<IRoom>(
  {
    roomNumber: { type: String, required: true, trim: true },
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
    roomType: {
      type: String,
      enum: ["Single", "Double", "Triple", "Quad"],
      default: "Double",
      required: true,
    },
    totalBeds: { type: Number, required: true, min: 1 },
    occupiedBeds: { type: Number, default: 0, min: 0 },
    availableBeds: { type: Number, default: 0, min: 0 },
    status: {
      type: String,
      enum: ["Available", "Partially Occupied", "Full", "Maintenance"],
      default: "Available",
      index: true,
    },
    facilities: [{ type: String }],
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

RoomSchema.index({ floorId: 1, roomNumber: 1 }, { unique: true });

export const Room =
  mongoose.models.Room || mongoose.model<IRoom>("Room", RoomSchema);
export default Room;
