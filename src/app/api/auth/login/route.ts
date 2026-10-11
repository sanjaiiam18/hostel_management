import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { loginSchema } from "@/lib/validations/auth";
import { verifyPassword } from "@/lib/auth/password";
import { signToken } from "@/lib/auth/jwt";
import { AUTH_COOKIE_NAME } from "@/lib/auth/session";
import { logAudit } from "@/lib/audit/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validatedData = loginSchema.safeParse(body);

    if (!validatedData.success) {
      return NextResponse.json(
        { error: "Invalid credentials format." },
        { status: 400 }
      );
    }

    const { identifier, password } = validatedData.data;

    await connectDB();

    // Query by lowercased email OR uppercased student ID
    const user = await User.findOne({
      $or: [
        { email: identifier.toLowerCase().trim() },
        { studentId: identifier.toUpperCase().trim() },
      ],
    });

    if (!user) {
      return NextResponse.json(
        { error: "Invalid email/Student ID or password." },
        { status: 401 }
      );
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: "Your account has been deactivated. Please contact the administrator." },
        { status: 403 }
      );
    }

    const isMatch = await verifyPassword(password, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json(
        { error: "Invalid email/Student ID or password." },
        { status: 401 }
      );
    }

    // Role is strictly derived from user record in database
    const token = await signToken({
      userId: user._id.toString(),
      email: user.email,
      role: user.role,
      name: user.name,
      studentId: user.studentId,
    });

    await logAudit({
      userId: user._id,
      userEmail: user.email,
      action: "USER_LOGIN",
      resource: "User",
      resourceId: user._id.toString(),
      details: { role: user.role },
    });

    const response = NextResponse.json(
      {
        message: "Login successful",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          studentId: user.studentId,
        },
      },
      { status: 200 }
    );

    response.cookies.set(AUTH_COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: 7 * 24 * 60 * 60,
      path: "/",
    });

    return response;
  } catch (error: any) {
    console.error("[Login Error]", error);
    return NextResponse.json(
      { error: "Internal server error during authentication." },
      { status: 500 }
    );
  }
}
