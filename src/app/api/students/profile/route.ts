import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import { profileUpdateSchema } from "@/lib/validations/operations";
import { logAudit } from "@/lib/audit/service";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const user = await User.findById(session.userId).select("-passwordHash").lean();
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const profile = await StudentProfile.findOne({ userId: session.userId })
      .populate("hostelId", "name code type wardenName wardenContact")
      .populate("blockId", "name")
      .populate("floorId", "floorNumber name")
      .populate("roomId", "roomNumber roomType facilities status")
      .populate("bedId", "bedNumber")
      .lean();

    return NextResponse.json({ user, profile });
  } catch (error) {
    console.error("[Get Profile Error]", error);
    return NextResponse.json({ error: "Failed to fetch profile" }, { status: 500 });
  }
}

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = profileUpdateSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    await connectDB();

    // Students are only allowed to update personal contact & guardian information
    const { phone, address, bloodGroup, guardianName, guardianPhone, guardianRelation } =
      validated.data;

    if (phone) {
      await User.findByIdAndUpdate(session.userId, { phone });
    }

    const updatedProfile = await StudentProfile.findOneAndUpdate(
      { userId: session.userId },
      {
        $set: {
          address,
          bloodGroup,
          guardianName,
          guardianPhone,
          guardianRelation,
        },
      },
      { new: true }
    );

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "PROFILE_UPDATED",
      resource: "StudentProfile",
      resourceId: updatedProfile?._id?.toString(),
    });

    return NextResponse.json({ message: "Profile updated successfully", profile: updatedProfile });
  } catch (error) {
    console.error("[Update Profile Error]", error);
    return NextResponse.json({ error: "Failed to update profile" }, { status: 500 });
  }
}
