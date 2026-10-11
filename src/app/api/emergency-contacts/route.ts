import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import EmergencyContact from "@/models/EmergencyContact";
import { logAudit } from "@/lib/audit/service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const contacts = await EmergencyContact.find({ isActive: true })
      .sort({ order: 1, createdAt: 1 })
      .lean();

    return NextResponse.json({ contacts });
  } catch (error) {
    console.error("[Get Emergency Contacts Error]", error);
    return NextResponse.json({ error: "Failed to fetch emergency contacts" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const { name, category, phoneNumber, location, availability, order } = body;

    if (!name || !category || !phoneNumber) {
      return NextResponse.json({ error: "Missing required contact fields" }, { status: 400 });
    }

    await connectDB();

    const contact = await EmergencyContact.create({
      name,
      category,
      phoneNumber,
      location,
      availability: availability || "24/7 Available",
      order: order || 0,
      isActive: true,
    });

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "EMERGENCY_CONTACT_ADDED",
      resource: "EmergencyContact",
      resourceId: contact._id.toString(),
      details: { name, category, phoneNumber },
    });

    return NextResponse.json({ message: "Contact added", contact }, { status: 201 });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Add Emergency Contact Error]", error);
    return NextResponse.json({ error: "Failed to add emergency contact" }, { status: 500 });
  }
}
