import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import LeaveRequest from "@/models/LeaveRequest";
import { reviewLeaveSchema } from "@/lib/validations/operations";
import { createNotification } from "@/lib/notifications/service";
import { logAudit } from "@/lib/audit/service";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const validated = reviewLeaveSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, remarks } = validated.data;

    await connectDB();
    const leave = await LeaveRequest.findById(params.id);

    if (!leave) {
      return NextResponse.json({ error: "Leave request not found" }, { status: 404 });
    }

    leave.status = status;
    leave.remarks = remarks || "";
    leave.reviewedBy = session.userId as any;
    leave.reviewedAt = new Date();
    await leave.save();

    // Notify the student
    await createNotification({
      userId: leave.studentId,
      title: `Leave Request ${status}`,
      message: `Your leave request for ${new Date(leave.startDate).toLocaleDateString()} has been ${status.toLowerCase()}.${
        remarks ? ` Remarks: ${remarks}` : ""
      }`,
      category: "leave",
      linkUrl: "/student/leaves",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: `LEAVE_${status.toUpperCase()}`,
      resource: "LeaveRequest",
      resourceId: leave._id.toString(),
      details: { status, remarks },
    });

    return NextResponse.json({
      message: `Leave request has been ${status.toLowerCase()}`,
      leave,
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Review Leave Error]", error);
    return NextResponse.json({ error: "Failed to review leave request." }, { status: 500 });
  }
}
