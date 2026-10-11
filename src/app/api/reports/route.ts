import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import Room from "@/models/Room";
import Bed from "@/models/Bed";
import Attendance from "@/models/Attendance";
import LeaveRequest from "@/models/LeaveRequest";
import Complaint from "@/models/Complaint";
import FeeRecord from "@/models/FeeRecord";
import VisitorRequest from "@/models/VisitorRequest";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const type = searchParams.get("type") || "student";
    const format = searchParams.get("format") || "json";

    await connectDB();

    let data: any[] = [];
    let filename = `report_${type}_${Date.now()}.csv`;

    if (type === "student") {
      const users = await User.find({ role: "student" }).sort({ name: 1 }).lean();
      const userIds = users.map((u) => u._id);
      const profiles = await StudentProfile.find({ userId: { $in: userIds } })
        .populate("hostelId", "name")
        .populate("roomId", "roomNumber")
        .populate("bedId", "bedNumber")
        .lean();

      const pMap = new Map();
      profiles.forEach((p) => pMap.set(p.userId.toString(), p));

      data = users.map((u) => {
        const p = pMap.get(u._id.toString());
        return {
          Name: u.name,
          StudentID: u.studentId || "N/A",
          Email: u.email,
          Phone: u.phone || "N/A",
          Department: p?.department || "N/A",
          Year: p?.academicYear || "N/A",
          Hostel: p?.hostelId?.name || "Unassigned",
          Room: p?.roomId?.roomNumber || "Unassigned",
          Bed: p?.bedId?.bedNumber || "Unassigned",
          Status: u.isActive ? "Active" : "Inactive",
        };
      });
    } else if (type === "occupancy") {
      const rooms = await Room.find()
        .populate("hostelId", "name")
        .populate("blockId", "name")
        .populate("floorId", "floorNumber")
        .sort({ roomNumber: 1 })
        .lean();

      data = rooms.map((r: any) => ({
        RoomNumber: r.roomNumber,
        Hostel: r.hostelId?.name || "N/A",
        Block: r.blockId?.name || "N/A",
        Floor: r.floorId?.floorNumber ?? "N/A",
        Type: r.roomType,
        TotalBeds: r.totalBeds,
        OccupiedBeds: r.occupiedBeds,
        AvailableBeds: r.availableBeds,
        Status: r.status,
      }));
    } else if (type === "attendance") {
      const records = await Attendance.find()
        .populate("studentId", "name studentId")
        .sort({ date: -1 })
        .limit(200)
        .lean();

      data = records.map((a: any) => ({
        Date: a.date,
        StudentName: a.studentId?.name || "N/A",
        StudentID: a.studentId?.studentId || "N/A",
        Status: a.status,
        Remarks: a.remarks || "",
      }));
    } else if (type === "leave") {
      const leaves = await LeaveRequest.find()
        .populate("studentId", "name studentId")
        .sort({ createdAt: -1 })
        .lean();

      data = leaves.map((l: any) => ({
        StudentName: l.studentId?.name || "N/A",
        StudentID: l.studentId?.studentId || "N/A",
        LeaveType: l.leaveType,
        StartDate: new Date(l.startDate).toISOString().split("T")[0],
        EndDate: new Date(l.endDate).toISOString().split("T")[0],
        Reason: l.reason,
        Destination: l.destination,
        ParentContact: l.parentContact,
        Status: l.status,
        Remarks: l.remarks || "",
      }));
    } else if (type === "complaint") {
      const complaints = await Complaint.find()
        .populate("studentId", "name studentId")
        .sort({ createdAt: -1 })
        .lean();

      data = complaints.map((c: any) => ({
        StudentName: c.studentId?.name || "N/A",
        StudentID: c.studentId?.studentId || "N/A",
        Category: c.category,
        Subject: c.subject,
        Priority: c.priority,
        Status: c.status,
        AssignedTo: c.assignedTo || "Unassigned",
        ResolutionNotes: c.resolutionNotes || "",
        FiledDate: new Date(c.createdAt).toLocaleDateString(),
      }));
    } else if (type === "fee") {
      const fees = await FeeRecord.find()
        .populate("studentId", "name studentId")
        .sort({ dueDate: -1 })
        .lean();

      data = fees.map((f: any) => ({
        StudentName: f.studentId?.name || "N/A",
        StudentID: f.studentId?.studentId || "N/A",
        Title: f.title,
        AcademicYear: f.academicYear,
        TotalAmount: f.totalAmount,
        PaidAmount: f.paidAmount,
        OutstandingAmount: f.outstandingAmount,
        DueDate: new Date(f.dueDate).toISOString().split("T")[0],
        Status: f.status,
      }));
    } else if (type === "visitor") {
      const visitors = await VisitorRequest.find()
        .populate("studentId", "name studentId")
        .sort({ visitDate: -1 })
        .lean();

      data = visitors.map((v: any) => ({
        StudentName: v.studentId?.name || "N/A",
        StudentID: v.studentId?.studentId || "N/A",
        VisitorName: v.visitorName,
        Relationship: v.relationship,
        Phone: v.phoneNumber,
        VisitDate: new Date(v.visitDate).toISOString().split("T")[0],
        ExpectedEntry: v.expectedEntryTime,
        ExpectedExit: v.expectedExitTime,
        ActualEntry: v.actualEntryTime || "N/A",
        ActualExit: v.actualExitTime || "N/A",
        Status: v.status,
        Purpose: v.purpose,
      }));
    }

    if (format === "csv") {
      if (data.length === 0) {
        return new NextResponse("No records found", {
          headers: {
            "Content-Type": "text/csv",
            "Content-Disposition": `attachment; filename="${filename}"`,
          },
        });
      }

      const headers = Object.keys(data[0]);
      const csvRows = [headers.join(",")];

      data.forEach((row) => {
        const values = headers.map((h) => {
          const val = row[h] ?? "";
          const escaped = ("" + val).replace(/"/g, '""');
          return `"${escaped}"`;
        });
        csvRows.push(values.join(","));
      });

      const csvString = csvRows.join("\n");
      return new NextResponse(csvString, {
        headers: {
          "Content-Type": "text/csv; charset=utf-8",
          "Content-Disposition": `attachment; filename="${filename}"`,
        },
      });
    }

    return NextResponse.json({ type, count: data.length, data });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Reports API Error]", error);
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 });
  }
}
