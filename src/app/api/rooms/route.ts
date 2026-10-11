import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Room from "@/models/Room";
import Bed from "@/models/Bed";
import { logAudit } from "@/lib/audit/service";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const hostelId = searchParams.get("hostelId");
    const blockId = searchParams.get("blockId");
    const floorId = searchParams.get("floorId");
    const status = searchParams.get("status");
    const availableOnly = searchParams.get("availableOnly") === "true";
    const search = searchParams.get("search");

    await connectDB();

    const query: any = {};
    if (hostelId) query.hostelId = hostelId;
    if (blockId) query.blockId = blockId;
    if (floorId) query.floorId = floorId;
    if (status) query.status = status;
    if (availableOnly) {
      query.availableBeds = { $gt: 0 };
      query.status = { $ne: "Maintenance" };
    }
    if (search) {
      query.roomNumber = { $regex: search, $options: "i" };
    }

    const rooms = await Room.find(query)
      .populate("hostelId", "name code")
      .populate("blockId", "name")
      .populate("floorId", "floorNumber name")
      .sort({ roomNumber: 1 })
      .lean();

    const roomIds = rooms.map((r) => r._id);
    const beds = await Bed.find({ roomId: { $in: roomIds } })
      .populate("currentStudentId", "name studentId email")
      .lean();

    const data = rooms.map((room) => {
      const roomBeds = beds.filter((b) => b.roomId.toString() === room._id.toString());
      return {
        ...room,
        _id: room._id.toString(),
        beds: roomBeds,
      };
    });

    return NextResponse.json({ rooms: data });
  } catch (error) {
    console.error("[Get Rooms Error]", error);
    return NextResponse.json({ error: "Failed to fetch rooms" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const { roomNumber, hostelId, blockId, floorId, roomType, totalBeds, facilities, description } =
      body;

    if (!roomNumber || !hostelId || !blockId || !floorId || !totalBeds) {
      return NextResponse.json({ error: "Missing required room fields" }, { status: 400 });
    }

    await connectDB();

    const existing = await Room.findOne({ floorId, roomNumber });
    if (existing) {
      return NextResponse.json(
        { error: "A room with this number already exists on this floor." },
        { status: 409 }
      );
    }

    const numBeds = parseInt(totalBeds, 10);
    const room = await Room.create({
      roomNumber,
      hostelId,
      blockId,
      floorId,
      roomType: roomType || "Double",
      totalBeds: numBeds,
      occupiedBeds: 0,
      availableBeds: numBeds,
      status: "Available",
      facilities: facilities || [],
      description,
    });

    // Automatically create Bed records
    const bedLabels = ["A", "B", "C", "D", "E", "F", "G", "H"];
    const bedsToCreate = [];
    for (let i = 0; i < numBeds; i++) {
      bedsToCreate.push({
        bedNumber: bedLabels[i] || `Bed-${i + 1}`,
        roomId: room._id,
        hostelId,
        blockId,
        floorId,
        isOccupied: false,
      });
    }

    await Bed.insertMany(bedsToCreate);

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "ROOM_CREATED",
      resource: "Room",
      resourceId: room._id.toString(),
      details: { roomNumber, totalBeds: numBeds },
    });

    return NextResponse.json({ room }, { status: 201 });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Create Room Error]", error);
    return NextResponse.json({ error: "Failed to create room" }, { status: 500 });
  }
}
