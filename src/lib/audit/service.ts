import connectDB from "@/lib/db/mongoose";
import AuditLog from "@/models/AuditLog";
import mongoose from "mongoose";

export interface LogAuditParams {
  userId?: string | mongoose.Types.ObjectId;
  userEmail?: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
}

export async function logAudit(params: LogAuditParams) {
  try {
    await connectDB();
    const log = await AuditLog.create({
      userId: params.userId,
      userEmail: params.userEmail,
      action: params.action,
      resource: params.resource,
      resourceId: params.resourceId,
      details: params.details,
      ipAddress: params.ipAddress,
    });
    return log;
  } catch (error) {
    console.error("[AuditLog Service Error]", error);
    return null;
  }
}
