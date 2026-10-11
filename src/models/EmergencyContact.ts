import mongoose, { Schema, Document } from "mongoose";

export interface IEmergencyContact extends Document {
  name: string;
  category:
    | "Warden"
    | "Hostel Office"
    | "Security"
    | "Ambulance"
    | "Police"
    | "Fire Service"
    | "College Administration";
  phoneNumber: string;
  location?: string;
  availability?: string;
  order: number;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmergencyContactSchema = new Schema<IEmergencyContact>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        "Warden",
        "Hostel Office",
        "Security",
        "Ambulance",
        "Police",
        "Fire Service",
        "College Administration",
      ],
      required: true,
      index: true,
    },
    phoneNumber: { type: String, required: true, trim: true },
    location: { type: String, trim: true },
    availability: { type: String, default: "24/7 Available", trim: true },
    order: { type: Number, default: 0 },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const EmergencyContact =
  mongoose.models.EmergencyContact ||
  mongoose.model<IEmergencyContact>("EmergencyContact", EmergencyContactSchema);
export default EmergencyContact;
