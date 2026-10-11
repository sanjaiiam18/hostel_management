import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
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

    const { studentId, targetHostelId, targetBlockId, targetFloorId, targetRoomId, targetBedId, remarks } =
      body;

    if (!studentId || !targetRoomId || !targetBedId) {
      return NextResponse.json({ error: "Missing required transfer fields" }, { status: 400 });
    }

    await connectDB();

    // Find current active allocation
    const currentAllocation = await RoomAllocation.findOne({
      studentId,
      status: "Active",
    });

    if (!currentAllocation) {
      return NextResponse.json(
        { error: "Student does not have an active room allocation to transfer from." },
        { status: 404 }
      );
    }

    // Verify target bed
    const targetBed = await Bed.findById(targetBedId);
    if (!targetBed) {
      return NextResponse.json({ error: "Target bed not found." }, { status: 404 });
    }
    if (targetBed.isOccupied) {
      return NextResponse.json({ error: "Target bed is already occupied." }, { status: 409 });
    }

    const oldRoomId = currentAllocation.roomId;
    const oldBedId = currentAllocation.bedId;

    // Release old bed
    await Bed.findByIdAndUpdate(oldBedId, {
      $set: { isOccupied: false, currentStudentId: null },
    });

    // Mark old allocation as Transferred
    currentAllocation.status = "Transferred";
    currentAllocation.deallocatedDate = new Date();
    currentAllocation.remarks = (currentAllocation.remarks || "") + ` | Transferred: ${remarks || ""}`;
    await currentAllocation.save();

    // Occupy target bed
    targetBed.isOccupied = true;
    targetBed.currentStudentId = studentId;
    await targetBed.save();

    // Create new active allocation
    const newAllocation = await RoomAllocation.create({
      studentId,
      hostelId: targetHostelId,
      blockId: targetBlockId,
      floorId: targetFloorId,
      roomId: targetRoomId,
      bedId: targetBedId,
      allocatedDate: new Date(),
      status: "Active",
      remarks: `Transferred from previous room. ${remarks || ""}`,
      allocatedBy: session.userId,
    });

    // Update student profile
    await StudentProfile.findOneAndUpdate(
      { userId: studentId },
      {
        $set: {
          hostelId: targetHostelId,
          blockId: targetBlockId,
          floorId: targetFloorId,
          roomId: targetRoomId,
          bedId: targetBedId,
          isAllocated: true,
        },
      }
    );

    // Update occupancy stats on old and new rooms
    for (const rid of [oldRoomId, targetRoomId]) {
      const occCount = await Bed.countDocuments({ roomId: rid, isOccupied: true });
      const room = await Room.findById(rid);
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
    }

    // Notify student
    await createNotification({
      userId: studentId,
      title: "Room Transfer Approved",
      message: `Your room assignment has been transferred to Bed ${targetBed.bedNumber}.`,
      category: "system",
      linkUrl: "/student/room",
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "ROOM_TRANSFERRED",
      resource: "RoomAllocation",
      resourceId: newAllocation._id.toString(),
      details: { studentId, oldBedId, targetBedId },
    });

    return NextResponse.json({ message: "Student transferred successfully", allocation: newAllocation });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Transfer Error]", error);
    return NextResponse.json({ error: "Failed to transfer room." }, { status: 500 });
  }
}
