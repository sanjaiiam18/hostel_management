import mongoose, { Schema, Document } from "mongoose";

export interface IStudentProfile extends Document {
  userId: mongoose.Types.ObjectId;
  studentId: string;
  department: string;
  academicYear: string;
  gender?: "Male" | "Female" | "Other";
  dateOfBirth?: Date;
  bloodGroup?: string;
  address?: string;
  guardianName?: string;
  guardianPhone?: string;
  guardianRelation?: string;
  hostelId?: mongoose.Types.ObjectId;
  blockId?: mongoose.Types.ObjectId;
  floorId?: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  bedId?: mongoose.Types.ObjectId;
  isAllocated: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const StudentProfileSchema = new Schema<IStudentProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      unique: true,
      index: true,
    },
    studentId: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      index: true,
    },
    department: { type: String, required: true, trim: true },
    academicYear: { type: String, required: true, trim: true },
    gender: { type: String, enum: ["Male", "Female", "Other"] },
    dateOfBirth: { type: Date },
    bloodGroup: { type: String, trim: true },
    address: { type: String, trim: true },
    guardianName: { type: String, trim: true },
    guardianPhone: { type: String, trim: true },
    guardianRelation: { type: String, trim: true },
    hostelId: { type: Schema.Types.ObjectId, ref: "Hostel" },
    blockId: { type: Schema.Types.ObjectId, ref: "Block" },
    floorId: { type: Schema.Types.ObjectId, ref: "Floor" },
    roomId: { type: Schema.Types.ObjectId, ref: "Room" },
    bedId: { type: Schema.Types.ObjectId, ref: "Bed" },
    isAllocated: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const StudentProfile =
  mongoose.models.StudentProfile ||
  mongoose.model<IStudentProfile>("StudentProfile", StudentProfileSchema);
export default StudentProfile;
