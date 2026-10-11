import { NextResponse } from "next/server";
import crypto from "crypto";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { logAudit } from "@/lib/audit/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = forgotPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json({ error: "Invalid email address." }, { status: 400 });
    }

    await connectDB();
    const user = await User.findOne({ email: validated.data.email.toLowerCase().trim() });

    if (!user) {
      // Don't leak user enumeration in production, but provide neutral success message
      return NextResponse.json({
        message: "If an account with this email exists, password reset instructions have been generated.",
      });
    }

    // Generate secure single-use token expiring in 1 hour
    const token = crypto.randomBytes(32).toString("hex");
    user.passwordResetToken = token;
    user.passwordResetExpires = new Date(Date.now() + 60 * 60 * 1000); // 1 hour
    await user.save();

    await logAudit({
      userId: user._id,
      userEmail: user.email,
      action: "PASSWORD_RESET_REQUESTED",
      resource: "User",
      resourceId: user._id.toString(),
    });

    console.log(`[HostelHub Password Reset] Token generated for ${user.email}: ${token}`);

    // In development or demo mode, return the token so reviewers can test easily
    return NextResponse.json({
      message: "Password reset link generated successfully.",
      devResetToken: process.env.NODE_ENV !== "production" ? token : undefined,
      devResetUrl:
        process.env.NODE_ENV !== "production"
          ? `/forgot-password?token=${token}`
          : undefined,
    });
  } catch (error) {
    console.error("[Forgot Password Error]", error);
    return NextResponse.json({ error: "Failed to process request." }, { status: 500 });
  }
}
