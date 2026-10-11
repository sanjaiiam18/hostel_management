import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Complaint from "@/models/Complaint";
import { updateComplaintSchema } from "@/lib/validations/operations";
import { createNotification } from "@/lib/notifications/service";
import { logAudit } from "@/lib/audit/service";

export async function GET(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const complaint = await Complaint.findById(params.id)
      .populate("studentId", "name studentId email phone")
      .lean();

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    if (session.role === "student" && complaint.studentId._id.toString() !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    return NextResponse.json({ complaint });
  } catch (error) {
    console.error("[Get Single Complaint Error]", error);
    return NextResponse.json({ error: "Failed to fetch complaint" }, { status: 500 });
  }
}

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const validated = updateComplaintSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { status, assignedTo, resolutionNotes } = validated.data;

    await connectDB();
    const complaint = await Complaint.findById(params.id);

    if (!complaint) {
      return NextResponse.json({ error: "Complaint not found" }, { status: 404 });
    }

    complaint.status = status;
    if (assignedTo !== undefined) complaint.assignedTo = assignedTo;
    if (resolutionNotes !== undefined) complaint.resolutionNotes = resolutionNotes;
    complaint.reviewedBy = session.userId as any;

    if (status === "Resolved") {
      complaint.resolvedAt = new Date();
    }

    await complaint.save();

    // Notify student about the update
    await createNotification({
      userId: complaint.studentId,
      title: `Complaint Status: ${status}`,
      message: `Your complaint regarding "${complaint.subject}" is now marked as ${status}.${
        resolutionNotes ? ` Note: ${resolutionNotes}` : ""
      }`,
      category: "complaint",
      linkUrl: "/student/complaints",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "COMPLAINT_UPDATED",
      resource: "Complaint",
      resourceId: complaint._id.toString(),
      details: { status, assignedTo, resolutionNotes },
    });

    return NextResponse.json({ message: "Complaint updated successfully", complaint });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Update Complaint Error]", error);
    return NextResponse.json({ error: "Failed to update complaint" }, { status: 500 });
  }
}

export const PATCH = PUT;

