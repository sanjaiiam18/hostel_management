import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import VisitorRequest from "@/models/VisitorRequest";
import { reviewVisitorSchema } from "@/lib/validations/operations";
import { createNotification } from "@/lib/notifications/service";
import { logAudit } from "@/lib/audit/service";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const validated = reviewVisitorSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, actualEntryTime, actualExitTime, remarks } = validated.data;

    await connectDB();
    const visitor = await VisitorRequest.findById(params.id);

    if (!visitor) {
      return NextResponse.json({ error: "Visitor request not found" }, { status: 404 });
    }

    visitor.status = status;
    if (actualEntryTime) visitor.actualEntryTime = actualEntryTime;
    if (actualExitTime) visitor.actualExitTime = actualExitTime;
    if (remarks !== undefined) visitor.remarks = remarks;
    visitor.reviewedBy = session.userId as any;
    await visitor.save();

    // Notify student
    await createNotification({
      userId: visitor.studentId,
      title: `Visitor Pass: ${status}`,
      message: `Your visitor request for ${visitor.visitorName} has been updated to "${status}".`,
      category: "visitor",
      linkUrl: "/student/visitors",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "VISITOR_STATUS_UPDATED",
      resource: "VisitorRequest",
      resourceId: visitor._id.toString(),
      details: { status, visitorName: visitor.visitorName },
    });

    return NextResponse.json({ message: `Visitor status updated to ${status}`, visitor });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Review Visitor Error]", error);
    return NextResponse.json({ error: "Failed to review visitor request" }, { status: 500 });
  }
}
