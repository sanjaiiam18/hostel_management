import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import FeeRecord from "@/models/FeeRecord";
import PaymentRecord from "@/models/PaymentRecord";
import { feeRecordSchema } from "@/lib/validations/operations";
import { createNotification } from "@/lib/notifications/service";
import { logAudit } from "@/lib/audit/service";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status");
    const studentIdParam = searchParams.get("studentId");

    await connectDB();

    const query: any = {};
    if (session.role === "student") {
      query.studentId = session.userId;
    } else {
      if (status && status !== "ALL") query.status = status;
      if (studentIdParam) query.studentId = studentIdParam;
    }

    const feeRecords = await FeeRecord.find(query)
      .populate("studentId", "name studentId email phone")
      .sort({ dueDate: -1 })
      .lean();

    const recordIds = feeRecords.map((f) => f._id);
    const payments = await PaymentRecord.find({ feeRecordId: { $in: recordIds } })
      .sort({ paymentDate: -1 })
      .lean();

    const data = feeRecords.map((rec) => {
      const recPayments = payments.filter(
        (p) => p.feeRecordId.toString() === rec._id.toString()
      );
      return {
        ...rec,
        _id: rec._id.toString(),
        payments: recPayments,
      };
    });

    // Summary calculations
    const totalFees = data.reduce((acc, f) => acc + f.totalAmount, 0);
    const totalPaid = data.reduce((acc, f) => acc + f.paidAmount, 0);
    const totalOutstanding = data.reduce((acc, f) => acc + f.outstandingAmount, 0);

    return NextResponse.json({
      fees: data,
      summary: {
        totalFees,
        totalPaid,
        totalOutstanding,
      },
    });
  } catch (error) {
    console.error("[Get Fees Error]", error);
    return NextResponse.json({ error: "Failed to fetch fee records" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const validated = feeRecordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { studentId, title, academicYear, semester, totalAmount, dueDate, remarks } =
      validated.data;

    await connectDB();

    const feeRecord = await FeeRecord.create({
      studentId,
      title,
      academicYear,
      semester,
      totalAmount,
      paidAmount: 0,
      outstandingAmount: totalAmount,
      dueDate: new Date(dueDate),
      status: "Pending",
      remarks,
    });

    await createNotification({
      userId: studentId,
      title: "New Hostel Fee Issued",
      message: `A new fee invoice "${title}" for ₹${totalAmount.toLocaleString()} has been generated. Due date: ${new Date(
        dueDate
      ).toLocaleDateString()}.`,
      category: "fee",
      linkUrl: "/student/fees",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "FEE_RECORD_CREATED",
      resource: "FeeRecord",
      resourceId: feeRecord._id.toString(),
      details: { studentId, totalAmount, title },
    });

    return NextResponse.json(
      { message: "Fee record created successfully", feeRecord },
      { status: 201 }
    );
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Create Fee Record Error]", error);
    return NextResponse.json({ error: "Failed to create fee record" }, { status: 500 });
  }
}
