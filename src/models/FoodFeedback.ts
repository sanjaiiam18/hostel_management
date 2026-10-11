import mongoose, { Schema, Document } from "mongoose";

export interface IFoodFeedback extends Document {
  studentId: mongoose.Types.ObjectId;
  mealType: "Breakfast" | "Lunch" | "Snacks" | "Dinner";
  date: string; // YYYY-MM-DD
  ratings: {
    foodQuality: number; // 1 to 5
    taste: number; // 1 to 5
    cleanliness: number; // 1 to 5
  };
  comment?: string;
  createdAt: Date;
  updatedAt: Date;
}

const FoodFeedbackSchema = new Schema<IFoodFeedback>(
  {
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    mealType: {
      type: String,
      enum: ["Breakfast", "Lunch", "Snacks", "Dinner"],
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    ratings: {
      foodQuality: { type: Number, required: true, min: 1, max: 5 },
      taste: { type: Number, required: true, min: 1, max: 5 },
      cleanliness: { type: Number, required: true, min: 1, max: 5 },
    },
    comment: { type: String, trim: true },
  },
  { timestamps: true }
);

FoodFeedbackSchema.index(
  { studentId: 1, mealType: 1, date: 1 },
  { unique: true }
);

export const FoodFeedback =
  mongoose.models.FoodFeedback ||
  mongoose.model<IFoodFeedback>("FoodFeedback", FoodFeedbackSchema);
export default FoodFeedback;
