import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import Room from "@/models/Room";
import Bed from "@/models/Bed";
import LeaveRequest from "@/models/LeaveRequest";
import Complaint from "@/models/Complaint";
import VisitorRequest from "@/models/VisitorRequest";
import FeeRecord from "@/models/FeeRecord";
import AuditLog from "@/models/AuditLog";
import Attendance from "@/models/Attendance";

export async function GET() {
  try {
    await requireAdmin();
    await connectDB();

    // 1. Core KPIs
    const [
      totalStudents,
      totalRooms,
      totalBeds,
      occupiedBeds,
      pendingLeaves,
      pendingComplaints,
      pendingVisitors,
      feeRecords,
    ] = await Promise.all([
      User.countDocuments({ role: "student", isActive: true }),
      Room.countDocuments(),
      Bed.countDocuments(),
      Bed.countDocuments({ isOccupied: true }),
      LeaveRequest.countDocuments({ status: "Pending" }),
      Complaint.countDocuments({ status: { $in: ["Submitted", "Under Review", "In Progress"] } }),
      VisitorRequest.countDocuments({ status: "Pending" }),
      FeeRecord.find().select("totalAmount paidAmount outstandingAmount").lean(),
    ]);

    const availableBeds = Math.max(0, totalBeds - occupiedBeds);
    const totalFees = feeRecords.reduce((acc, f) => acc + (f.totalAmount || 0), 0);
    const totalCollected = feeRecords.reduce((acc, f) => acc + (f.paidAmount || 0), 0);
    const totalOutstanding = feeRecords.reduce((acc, f) => acc + (f.outstandingAmount || 0), 0);

    // 2. Room Occupancy Chart Data
    const occupancyData = [
      { name: "Occupied Beds", value: occupiedBeds, color: "#4f46e5" },
      { name: "Available Beds", value: availableBeds, color: "#10b981" },
    ];

    // 3. Leave Status Distribution
    const [approvedLeaves, rejectedLeaves] = await Promise.all([
      LeaveRequest.countDocuments({ status: "Approved" }),
      LeaveRequest.countDocuments({ status: "Rejected" }),
    ]);
    const leaveStatusData = [
      { status: "Pending", count: pendingLeaves, color: "#f59e0b" },
      { status: "Approved", count: approvedLeaves, color: "#10b981" },
      { status: "Rejected", count: rejectedLeaves, color: "#ef4444" },
    ];

    // 4. Complaint Category Breakdown
    const complaintsByCategory = await Complaint.aggregate([
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);
    const complaintCategoryData = complaintsByCategory.map((c) => ({
      category: c._id,
      count: c.count,
    }));

    // 5. Fee Comparison Data
    const feeComparisonData = [
      { name: "Collected", amount: totalCollected, fill: "#10b981" },
      { name: "Outstanding", amount: totalOutstanding, fill: "#ef4444" },
    ];

    // 6. Recent Action Items
    const [recentLeaves, recentComplaints, recentVisitors, recentAuditLogs] =
      await Promise.all([
        LeaveRequest.find({ status: "Pending" })
          .populate("studentId", "name studentId")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        Complaint.find()
          .populate("studentId", "name studentId")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        VisitorRequest.find()
          .populate("studentId", "name studentId")
          .sort({ createdAt: -1 })
          .limit(5)
          .lean(),
        AuditLog.find()
          .sort({ createdAt: -1 })
          .limit(6)
          .lean(),
      ]);

    return NextResponse.json({
      stats: {
        totalStudents,
        totalRooms,
        totalBeds,
        occupiedBeds,
        availableBeds,
        pendingLeaves,
        pendingComplaints,
        pendingVisitors,
        totalFees,
        totalCollected,
        totalOutstanding,
      },
      charts: {
        occupancyData,
        leaveStatusData,
        complaintCategoryData,
        feeComparisonData,
      },
      actionItems: {
        recentLeaves,
        recentComplaints,
        recentVisitors,
        recentAuditLogs,
      },
    });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Admin Dashboard Error]", error);
    return NextResponse.json({ error: "Failed to load dashboard data" }, { status: 500 });
  }
}
