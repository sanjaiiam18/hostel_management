import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Complaint from "@/models/Complaint";
import { complaintSchema } from "@/lib/validations/operations";
import { logAudit } from "@/lib/audit/service";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const status = searchParams.get("status");

    await connectDB();

    const query: any = {};
    if (session.role === "student") {
      query.studentId = session.userId;
    } else {
      if (category && category !== "ALL") query.category = category;
      if (priority && priority !== "ALL") query.priority = priority;
      if (status && status !== "ALL") query.status = status;
    }

    const complaints = await Complaint.find(query)
      .populate("studentId", "name studentId email phone")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ complaints });
  } catch (error) {
    console.error("[Get Complaints Error]", error);
    return NextResponse.json({ error: "Failed to fetch complaints" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
    }

    const body = await req.json();
    const validated = complaintSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { category, subject, description, priority, attachmentUrl } = validated.data;

    await connectDB();

    const complaint = await Complaint.create({
      studentId: session.userId,
      category,
      subject,
      description,
      priority,
      attachmentUrl,
      status: "Submitted",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "COMPLAINT_FILED",
      resource: "Complaint",
      resourceId: complaint._id.toString(),
      details: { category, priority, subject },
    });

    return NextResponse.json(
      { message: "Complaint submitted successfully", complaint },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Create Complaint Error]", error);
    return NextResponse.json({ error: "Failed to submit complaint" }, { status: 500 });
  }
}
