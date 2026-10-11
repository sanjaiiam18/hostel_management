import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import Room from "@/models/Room";
import Bed from "@/models/Bed";
import RoomAllocation from "@/models/RoomAllocation";
import { allocationSchema } from "@/lib/validations/operations";
import { createNotification } from "@/lib/notifications/service";
import { logAudit } from "@/lib/audit/service";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);
    const status = searchParams.get("status") || "Active";

    await connectDB();
    const allocations = await RoomAllocation.find({ status })
      .populate("studentId", "name email studentId phone")
      .populate("hostelId", "name code")
      .populate("blockId", "name")
      .populate("floorId", "floorNumber")
      .populate("roomId", "roomNumber roomType")
      .populate("bedId", "bedNumber")
      .sort({ createdAt: -1 })
      .lean();

    return NextResponse.json({ allocations });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to fetch allocations" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const validated = allocationSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { studentId, hostelId, blockId, floorId, roomId, bedId, remarks } = validated.data;

    await connectDB();

    // Check student existence and active status
    const student = await User.findById(studentId);
    if (!student || student.role !== "student") {
      return NextResponse.json({ error: "Student not found or invalid role." }, { status: 404 });
    }

    // Prevent duplicate active allocations
    const activeAllocation = await RoomAllocation.findOne({
      studentId,
      status: "Active",
    });
    if (activeAllocation) {
      return NextResponse.json(
        { error: "Student already has an active room allocation. Use transfer instead." },
        { status: 409 }
      );
    }

    // Verify bed availability
    const bed = await Bed.findById(bedId);
    if (!bed) {
      return NextResponse.json({ error: "Bed not found." }, { status: 404 });
    }
    if (bed.isOccupied) {
      return NextResponse.json({ error: "Selected bed is already occupied." }, { status: 409 });
    }

    // Update bed
    bed.isOccupied = true;
    bed.currentStudentId = student._id;
    await bed.save();

    // Create RoomAllocation record
    const allocation = await RoomAllocation.create({
      studentId,
      hostelId,
      blockId,
      floorId,
      roomId,
      bedId,
      allocatedDate: new Date(),
      status: "Active",
      remarks,
      allocatedBy: session.userId,
    });

    // Update StudentProfile
    await StudentProfile.findOneAndUpdate(
      { userId: student._id },
      {
        $set: {
          hostelId,
          blockId,
          floorId,
          roomId,
          bedId,
          isAllocated: true,
        },
      }
    );

    // Recalculate room occupancy counters
    const occupiedCount = await Bed.countDocuments({ roomId, isOccupied: true });
    const room = await Room.findById(roomId);
    if (room) {
      room.occupiedBeds = occupiedCount;
      room.availableBeds = Math.max(0, room.totalBeds - occupiedCount);
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
      userId: student._id,
      title: "Room Allocated",
      message: `You have been allocated Bed ${bed.bedNumber} in Room ${room?.roomNumber || ""}.`,
      category: "system",
      linkUrl: "/student/room",
    });

    // Audit log
    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "ROOM_ALLOCATED",
      resource: "RoomAllocation",
      resourceId: allocation._id.toString(),
      details: { studentId, roomId, bedId },
    });

    return NextResponse.json({ message: "Bed allocated successfully", allocation }, { status: 201 });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Allocation Error]", error);
    return NextResponse.json({ error: "Failed to allocate room." }, { status: 500 });
  }
}
