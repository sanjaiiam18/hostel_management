import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Hostel from "@/models/Hostel";
import Block from "@/models/Block";
import Floor from "@/models/Floor";
import Room from "@/models/Room";
import { logAudit } from "@/lib/audit/service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const hostels = await Hostel.find({ isActive: true }).sort({ name: 1 }).lean();

    const hostelIds = hostels.map((h) => h._id);
    const blocks = await Block.find({ hostelId: { $in: hostelIds } }).lean();
    const floors = await Floor.find({ hostelId: { $in: hostelIds } }).lean();

    const data = hostels.map((hostel) => {
      const hostelBlocks = blocks.filter(
        (b) => b.hostelId.toString() === hostel._id.toString()
      );
      const hostelFloors = floors.filter(
        (f) => f.hostelId.toString() === hostel._id.toString()
      );
      return {
        ...hostel,
        _id: hostel._id.toString(),
        blocks: hostelBlocks,
        floors: hostelFloors,
      };
    });

    return NextResponse.json({ hostels: data });
  } catch (error) {
    console.error("[Get Hostels Error]", error);
    return NextResponse.json({ error: "Failed to fetch hostels" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const { name, code, type, wardenName, wardenContact, totalCapacity, description } = body;

    if (!name || !code || !wardenName || !wardenContact) {
      return NextResponse.json({ error: "Missing required hostel fields" }, { status: 400 });
    }

    await connectDB();
    const existing = await Hostel.findOne({ code: code.toUpperCase() });
    if (existing) {
      return NextResponse.json({ error: "Hostel code already exists" }, { status: 409 });
    }

    const hostel = await Hostel.create({
      name,
      code: code.toUpperCase(),
      type: type || "boys",
      wardenName,
      wardenContact,
      totalCapacity: totalCapacity || 0,
      description,
      isActive: true,
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "HOSTEL_CREATED",
      resource: "Hostel",
      resourceId: hostel._id.toString(),
      details: { name, code },
    });

    return NextResponse.json({ hostel }, { status: 201 });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Create Hostel Error]", error);
    return NextResponse.json({ error: "Failed to create hostel" }, { status: 500 });
  }
}
