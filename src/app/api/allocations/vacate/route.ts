import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import StudentProfile from "@/models/StudentProfile";
import Room from "@/models/Room";
import Bed from "@/models/Bed";
import RoomAllocation from "@/models/RoomAllocation";
import { createNotification } from "@/lib/notifications/service";
import { logAudit } from "@/lib/audit/service";

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const { studentId, remarks } = body;

    if (!studentId) {
      return NextResponse.json({ error: "Student ID is required" }, { status: 400 });
    }

    await connectDB();

    const currentAllocation = await RoomAllocation.findOne({
      studentId,
      status: "Active",
    });

    if (!currentAllocation) {
      return NextResponse.json(
        { error: "No active room allocation found for this student." },
        { status: 404 }
      );
    }

    const roomId = currentAllocation.roomId;
    const bedId = currentAllocation.bedId;

    // Release bed
    await Bed.findByIdAndUpdate(bedId, {
      $set: { isOccupied: false, currentStudentId: null },
    });

    // Mark allocation as Vacated
    currentAllocation.status = "Vacated";
    currentAllocation.deallocatedDate = new Date();
    currentAllocation.remarks = (currentAllocation.remarks || "") + ` | Vacated: ${remarks || ""}`;
    await currentAllocation.save();

    // Clear student allocation profile
    await StudentProfile.findOneAndUpdate(
      { userId: studentId },
      {
        $set: {
          hostelId: null,
          blockId: null,
          floorId: null,
          roomId: null,
          bedId: null,
          isAllocated: false,
        },
      }
    );

    // Update room counters
    const occCount = await Bed.countDocuments({ roomId, isOccupied: true });
    const room = await Room.findById(roomId);
    if (room) {
      room.occupiedBeds = occCount;
      room.availableBeds = Math.max(0, room.totalBeds - occCount);
      room.status =
        room.occupiedBeds === 0
          ? "Available"
          : room.occupiedBeds >= room.totalBeds
          ? "Full"
          : "Partially Occupied";
      await room.save();
    }

    // Notify student
    await createNotification({
      userId: studentId,
      title: "Room Vacated",
      message: "You have been checked out and your room allocation has been vacated.",
      category: "system",
      linkUrl: "/student/room",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "ROOM_VACATED",
      resource: "RoomAllocation",
      resourceId: currentAllocation._id.toString(),
      details: { studentId, roomId, bedId },
    });

    return NextResponse.json({ message: "Student room vacated successfully" });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Vacate Error]", error);
    return NextResponse.json({ error: "Failed to vacate room." }, { status: 500 });
  }
}
