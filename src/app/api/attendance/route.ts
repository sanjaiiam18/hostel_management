import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Attendance from "@/models/Attendance";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import { attendanceMarkSchema } from "@/lib/validations/operations";
import { logAudit } from "@/lib/audit/service";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    await connectDB();

    // If Student: return their personal records and calculated statistics
    if (session.role === "student") {
      const records = await Attendance.find({ studentId: session.userId })
        .sort({ date: -1 })
        .lean();

      const totalRecorded = records.length;
      const presentDays = records.filter((r) => r.status === "Present").length;
      const absentDays = records.filter((r) => r.status === "Absent").length;
      const percentage =
        totalRecorded === 0
          ? 100
          : Math.round((presentDays / totalRecorded) * 100 * 10) / 10;

      return NextResponse.json({
        records,
        stats: {
          totalRecorded,
          presentDays,
          absentDays,
          percentage,
        },
      });
    }

    // If Admin: allow filtering by date, student search, department
    const date = searchParams.get("date") || new Date().toISOString().split("T")[0];
    const department = searchParams.get("department");

    // Fetch all active students
    const studentUsers = await User.find({ role: "student", isActive: true })
      .select("name email studentId")
      .lean();

    const studentIds = studentUsers.map((u) => u._id);
    const profiles = await StudentProfile.find({ userId: { $in: studentIds } })
      .populate("hostelId", "name")
      .populate("roomId", "roomNumber")
      .lean();

    const profileMap = new Map();
    profiles.forEach((p) => profileMap.set(p.userId.toString(), p));

    // Get attendance records for given date
    const attendanceRecords = await Attendance.find({
      date,
      studentId: { $in: studentIds },
    }).lean();

    const attendanceMap = new Map();
    attendanceRecords.forEach((a) => attendanceMap.set(a.studentId.toString(), a));

    let results = studentUsers.map((student) => {
      const prof = profileMap.get(student._id.toString());
      const att = attendanceMap.get(student._id.toString());
      return {
        studentId: student._id.toString(),
        name: student.name,
        rollNumber: student.studentId,
        email: student.email,
        department: prof?.department || "N/A",
        hostelName: prof?.hostelId?.name || "Unassigned",
        roomNumber: prof?.roomId?.roomNumber || "N/A",
        status: att ? att.status : "Unmarked",
        remarks: att ? att.remarks : "",
        recordId: att ? att._id.toString() : null,
      };
    });

    if (department) {
      results = results.filter((r) => r.department === department);
    }

    // Calculate summary statistics for the selected date
    const totalStudents = results.length;
    const presentCount = results.filter((r) => r.status === "Present").length;
    const absentCount = results.filter((r) => r.status === "Absent").length;
    const unmarkedCount = results.filter((r) => r.status === "Unmarked").length;

    return NextResponse.json({
      date,
      students: results,
      stats: {
        totalStudents,
        presentCount,
        absentCount,
        unmarkedCount,
        presentPercentage:
          totalStudents > 0
            ? Math.round((presentCount / totalStudents) * 100 * 10) / 10
            : 0,
      },
    });
  } catch (error) {
    console.error("[Get Attendance Error]", error);
    return NextResponse.json({ error: "Failed to fetch attendance" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const validated = attendanceMarkSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { studentId, date, status, remarks } = validated.data;

    await connectDB();

    const record = await Attendance.findOneAndUpdate(
      { studentId, date },
      {
        $set: {
          status,
          remarks,
          markedBy: session.userId,
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "ATTENDANCE_MARKED",
      resource: "Attendance",
      resourceId: record._id.toString(),
      details: { studentId, date, status },
    });

    return NextResponse.json({ message: "Attendance marked successfully", record });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Post Attendance Error]", error);
    return NextResponse.json({ error: "Failed to mark attendance" }, { status: 500 });
  }
}
