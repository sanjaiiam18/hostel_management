import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";

export async function GET(req: Request) {
  try {
    await requireAdmin();
    const { searchParams } = new URL(req.url);

    const search = searchParams.get("search") || "";
    const department = searchParams.get("department") || "";
    const isAllocated = searchParams.get("isAllocated");
    const hostelId = searchParams.get("hostelId");
    const page = parseInt(searchParams.get("page") || "1", 10);
    const limit = parseInt(searchParams.get("limit") || "20", 10);

    await connectDB();

    const query: any = { role: "student" };
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: "i" } },
        { email: { $regex: search, $options: "i" } },
        { studentId: { $regex: search, $options: "i" } },
      ];
    }

    const totalUsers = await User.countDocuments(query);
    const users = await User.find(query)
      .select("-passwordHash")
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ createdAt: -1 })
      .lean();

    const userIds = users.map((u) => u._id);

    const profileQuery: any = { userId: { $in: userIds } };
    if (department) profileQuery.department = department;
    if (isAllocated !== null && isAllocated !== undefined && isAllocated !== "") {
      profileQuery.isAllocated = isAllocated === "true";
    }
    if (hostelId) profileQuery.hostelId = hostelId;

    const profiles = await StudentProfile.find(profileQuery)
      .populate("hostelId", "name code")
      .populate("roomId", "roomNumber roomType")
      .populate("bedId", "bedNumber")
      .lean();

    const profileMap = new Map();
    profiles.forEach((p) => {
      profileMap.set(p.userId.toString(), p);
    });

    const students = users
      .map((u) => ({
        ...u,
        _id: u._id.toString(),
        profile: profileMap.get(u._id.toString()) || null,
      }))
      .filter((s) => !department && isAllocated === null && !hostelId || s.profile !== null);

    return NextResponse.json({
      students,
      pagination: {
        page,
        limit,
        total: totalUsers,
        pages: Math.ceil(totalUsers / limit),
      },
    });
  } catch (error: any) {
    if (error.message === "UNAUTHORIZED" || error.message === "FORBIDDEN") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Get Students Error]", error);
    return NextResponse.json({ error: "Failed to fetch students" }, { status: 500 });
  }
}
