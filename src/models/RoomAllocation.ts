import mongoose, { Schema, Document } from "mongoose";

export interface IRoomAllocation extends Document {
  studentId: mongoose.Types.ObjectId;
  hostelId: mongoose.Types.ObjectId;
  blockId: mongoose.Types.ObjectId;
  floorId: mongoose.Types.ObjectId;
  roomId: mongoose.Types.ObjectId;
  bedId: mongoose.Types.ObjectId;
  allocatedDate: Date;
  deallocatedDate?: Date;
  status: "Active" | "Transferred" | "Vacated";
  remarks?: string;
  allocatedBy?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const RoomAllocationSchema = new Schema<IRoomAllocation>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
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
    roomId: {
      type: Schema.Types.ObjectId,
      ref: "Room",
      required: true,
      index: true,
    },
    bedId: {
      type: Schema.Types.ObjectId,
      ref: "Bed",
      required: true,
      index: true,
    },
    allocatedDate: { type: Date, default: Date.now },
    deallocatedDate: { type: Date },
    status: {
      type: String,
      enum: ["Active", "Transferred", "Vacated"],
      default: "Active",
      index: true,
    },
    remarks: { type: String, trim: true },
    allocatedBy: { type: Schema.Types.ObjectId, ref: "User" },
  },
  { timestamps: true }
);

// We can have index for active student allocation checks
RoomAllocationSchema.index({ studentId: 1, status: 1 });

export const RoomAllocation =
  mongoose.models.RoomAllocation ||
  mongoose.model<IRoomAllocation>("RoomAllocation", RoomAllocationSchema);
export default RoomAllocation;
