import { NextResponse } from "next/server";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { resetPasswordSchema } from "@/lib/validations/auth";
import { hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit/service";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const validated = resetPasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Invalid password reset parameters", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { token, password } = validated.data;

    await connectDB();
    const user = await User.findOne({
      passwordResetToken: token,
      passwordResetExpires: { $gt: new Date() },
    });

    if (!user) {
      return NextResponse.json(
        { error: "Password reset token is invalid or has expired." },
        { status: 400 }
      );
    }

    user.passwordHash = await hashPassword(password);
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save();

    await logAudit({
      userId: user._id,
      userEmail: user.email,
      action: "PASSWORD_RESET_COMPLETED",
      resource: "User",
      resourceId: user._id.toString(),
    });

    return NextResponse.json({ message: "Password has been successfully updated. You may now log in." });
  } catch (error) {
    console.error("[Reset Password Error]", error);
    return NextResponse.json({ error: "Failed to reset password." }, { status: 500 });
  }
}
