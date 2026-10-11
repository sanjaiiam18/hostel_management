import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import LeaveRequest from "@/models/LeaveRequest";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import { leaveRequestSchema } from "@/lib/validations/operations";
import { logAudit } from "@/lib/audit/service";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");

    await connectDB();

    const query: any = {};
    if (session.role === "student") {
      // Students can strictly only view their own requests
      query.studentId = session.userId;
    } else {
      if (status && status !== "ALL") {
        query.status = status;
      }
    }

    const leaves = await LeaveRequest.find(query)
      .populate("studentId", "name email studentId phone")
      .populate("reviewedBy", "name")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ leaves });
  } catch (error) {
    console.error("[Get Leaves Error]", error);
    return NextResponse.json({ error: "Failed to fetch leaves" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
    }

    const body = await req.json();
    const validated = leaveRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { leaveType, startDate, endDate, reason, parentContact, destination } = validated.data;

    await connectDB();

    const newLeave = await LeaveRequest.create({
      studentId: session.userId,
      leaveType,
      startDate: new Date(startDate),
      endDate: new Date(endDate),
      reason,
      parentContact,
      destination,
      status: "Pending",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "LEAVE_REQUESTED",
      resource: "LeaveRequest",
      resourceId: newLeave._id.toString(),
      details: { leaveType, startDate, endDate },
    });

    return NextResponse.json(
      { message: "Leave request submitted successfully", leave: newLeave },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Create Leave Error]", error);
    return NextResponse.json({ error: "Failed to submit leave request." }, { status: 500 });
  }
}
