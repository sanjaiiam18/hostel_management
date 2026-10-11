import connectDB from "@/lib/db/mongoose";
import Notification from "@/models/Notification";
import mongoose from "mongoose";

export interface CreateNotificationParams {
  userId: string | mongoose.Types.ObjectId;
  title: string;
  message: string;
  category: "leave" | "complaint" | "notice" | "fee" | "visitor" | "system" | "emergency";
  linkUrl?: string;
}

export async function createNotification(params: CreateNotificationParams) {
  try {
    await connectDB();
    const notification = await Notification.create({
      userId: params.userId,
      title: params.title,
      message: params.message,
      category: params.category,
      linkUrl: params.linkUrl,
      isRead: false,
    });
    return notification;
  } catch (error) {
    console.error("[Notification Service Error]", error);
    return null;
  }
}
