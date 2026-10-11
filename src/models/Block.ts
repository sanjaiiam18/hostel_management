import mongoose, { Schema, Document } from "mongoose";

export interface IBlock extends Document {
  name: string;
  hostelId: mongoose.Types.ObjectId;
  description?: string;
  createdAt: Date;
  updatedAt: Date;
}

const BlockSchema = new Schema<IBlock>(
  {
    name: { type: String, required: true, trim: true },
    hostelId: {
      type: Schema.Types.ObjectId,
      ref: "Hostel",
      required: true,
      index: true,
    },
    description: { type: String, trim: true },
  },
  { timestamps: true }
);

BlockSchema.index({ hostelId: 1, name: 1 }, { unique: true });

export const Block =
  mongoose.models.Block || mongoose.model<IBlock>("Block", BlockSchema);
export default Block;
