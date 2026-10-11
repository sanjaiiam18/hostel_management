import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId)
      .select("-passwordHash")
      .lean();

    if (!user || !user.isActive) {
      return NextResponse.json({ user: null }, { status: 401 });
    }

    let profile = null;
    if (user.role === "student") {
      profile = await StudentProfile.findOne({ userId: user._id })
        .populate("hostelId", "name code")
        .populate("blockId", "name")
        .populate("floorId", "floorNumber name")
        .populate("roomId", "roomNumber roomType")
        .populate("bedId", "bedNumber")
        .lean();
    }

    return NextResponse.json({
      user: {
        ...user,
        _id: user._id.toString(),
      },
      profile,
    });
  } catch (error) {
    console.error("[Auth Me Error]", error);
    return NextResponse.json({ error: "Failed to fetch user" }, { status: 500 });
  }
}
