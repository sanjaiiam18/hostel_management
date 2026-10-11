import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Attendance from "@/models/Attendance";
import { bulkAttendanceSchema } from "@/lib/validations/operations";
import { logAudit } from "@/lib/audit/service";

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const validated = bulkAttendanceSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { date, records } = validated.data;
    await connectDB();

    const bulkOps = records.map((rec) => ({
      updateOne: {
        filter: { studentId: rec.studentId, date },
        update: {
          $set: {
            status: rec.status,
            remarks: rec.remarks || "",
            markedBy: session.userId,
          },
        },
        upsert: true,
      },
    }));

    if (bulkOps.length > 0) {
      await Attendance.bulkWrite(bulkOps);
    }

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "ATTENDANCE_BULK_MARKED",
      resource: "Attendance",
      details: { date, count: records.length },
    });

    return NextResponse.json({
      message: `Bulk attendance recorded for ${records.length} students on ${date}.`,
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Bulk Attendance Error]", error);
    return NextResponse.json({ error: "Failed to process bulk attendance" }, { status: 500 });
  }
}
