import mongoose, { Schema, Document } from "mongoose";

export interface IMealDetails {
  breakfast: string;
  lunch: string;
  snacks: string;
  dinner: string;
}

export interface IMessMenu extends Document {
  title: string;
  weekNumber: number;
  year: number;
  schedule: {
    monday: IMealDetails;
    tuesday: IMealDetails;
    wednesday: IMealDetails;
    thursday: IMealDetails;
    friday: IMealDetails;
    saturday: IMealDetails;
    sunday: IMealDetails;
  };
  status: "Draft" | "Published" | "Archived";
  createdAt: Date;
  updatedAt: Date;
}

const MealDetailsSchema = new Schema(
  {
    breakfast: { type: String, default: "" },
    lunch: { type: String, default: "" },
    snacks: { type: String, default: "" },
    dinner: { type: String, default: "" },
  },
  { _id: false }
);

const MessMenuSchema = new Schema<IMessMenu>(
  {
    title: { type: String, required: true, trim: true },
    weekNumber: { type: Number, required: true },
    year: { type: Number, required: true },
    schedule: {
      monday: { type: MealDetailsSchema, required: true },
      tuesday: { type: MealDetailsSchema, required: true },
      wednesday: { type: MealDetailsSchema, required: true },
      thursday: { type: MealDetailsSchema, required: true },
      friday: { type: MealDetailsSchema, required: true },
      saturday: { type: MealDetailsSchema, required: true },
      sunday: { type: MealDetailsSchema, required: true },
    },
    status: {
      type: String,
      enum: ["Draft", "Published", "Archived"],
      default: "Published",
      index: true,
    },
  },
  { timestamps: true }
);

MessMenuSchema.index({ year: 1, weekNumber: 1 });

export const MessMenu =
  mongoose.models.MessMenu ||
  mongoose.model<IMessMenu>("MessMenu", MessMenuSchema);
export default MessMenu;
