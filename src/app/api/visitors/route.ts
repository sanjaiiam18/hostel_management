import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import VisitorRequest from "@/models/VisitorRequest";
import { visitorRequestSchema } from "@/lib/validations/operations";
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
      query.studentId = session.userId;
    } else {
      if (status && status !== "ALL") query.status = status;
    }

    const visitors = await VisitorRequest.find(query)
      .populate("studentId", "name studentId email phone")
      .populate("reviewedBy", "name")
      .sort({ visitDate: -1, createdAt: -1 })
      .lean();

    return NextResponse.json({ visitors });
  } catch (error) {
    console.error("[Get Visitors Error]", error);
    return NextResponse.json({ error: "Failed to fetch visitor records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
    }

    const body = await req.json();
    const validated = visitorRequestSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const {
      visitorName,
      relationship,
      phoneNumber,
      visitDate,
      expectedEntryTime,
      expectedExitTime,
      purpose,
    } = validated.data;

    await connectDB();

    const visitor = await VisitorRequest.create({
      studentId: session.userId,
      visitorName,
      relationship,
      phoneNumber,
      visitDate: new Date(visitDate),
      expectedEntryTime,
      expectedExitTime,
      purpose,
      status: "Pending",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "VISITOR_REGISTERED",
      resource: "VisitorRequest",
      resourceId: visitor._id.toString(),
      details: { visitorName, relationship, visitDate },
    });

    return NextResponse.json(
      { message: "Visitor pass request submitted", visitor },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Post Visitor Error]", error);
    return NextResponse.json({ error: "Failed to submit visitor request" }, { status: 500 });
  }
}
