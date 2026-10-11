import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import StudentProfile from "@/models/StudentProfile";
import { registerSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = registerSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validatedData.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { name, email, studentId, phone, department, academicYear, gender, password } =
      validatedData.data;

    await connectDB();

    // Enforce uniqueness of email and studentId
    const existingUser = await User.findOne({
      $or: [{ email: email.toLowerCase() }, { studentId: studentId.toUpperCase() }],
    });

    if (existingUser) {
      if (existingUser.email === email.toLowerCase()) {
        return NextResponse.json(
          { error: "An account with this email address already exists." },
          { status: 409 }
        );
      }
      return NextResponse.json(
        { error: "An account with this Student ID already exists." },
        { status: 409 }
      );
    }

    const passwordHash = await hashPassword(password);

    // Public registration only ever creates student role
    const newUser = await User.create({
      name,
      email: email.toLowerCase(),
      studentId: studentId.toUpperCase(),
      phone,
      passwordHash,
      role: "student",
      isActive: true,
    });

    // Create corresponding StudentProfile
    await StudentProfile.create({
      userId: newUser._id,
      studentId: newUser.studentId,
      department,
      academicYear,
      gender,
      isAllocated: false,
    });

    await logAudit({
      userId: newUser._id,
      userEmail: newUser.email,
      action: "STUDENT_REGISTERED",
      resource: "User",
      resourceId: newUser._id.toString(),
      details: { studentId: newUser.studentId, department },
    });

    // Create auth token and session cookie
    const token = await signToken({
      userId: newUser._id.toString(),
      email: newUser.email,
      role: newUser.role,
      name: newUser.name,
      studentId: newUser.studentId,
    });

    const response = NextResponse.json(
      {
        message: "Registration successful",
        user: {
          id: newUser._id,
          name: newUser.name,
          email: newUser.email,
          role: newUser.role,
          studentId: newUser.studentId,
        },
      },
      { status: 201 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Register Error]", error);
    return NextResponse.json(
      { error: "Internal server error during registration." },
      { status: 500 }
    );
  }
}
