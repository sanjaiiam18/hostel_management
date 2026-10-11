import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import User from "@/models/User";
import { changePasswordSchema } from "@/lib/validations/auth";
import { verifyPassword, hashPassword } from "@/lib/auth/password";
import { logAudit } from "@/lib/audit/service";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const body = await req.json();
    const validated = changePasswordSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { currentPassword, newPassword } = validated.data;

    await connectDB();
    const user = await User.findById(session.userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const isMatch = await verifyPassword(currentPassword, user.passwordHash);
    if (!isMatch) {
      return NextResponse.json({ error: "Incorrect current password." }, { status: 400 });
    }

    user.passwordHash = await hashPassword(newPassword);
    await user.save();

    await logAudit({
      userId: user._id,
      userEmail: user.email,
      action: "PASSWORD_CHANGED",
      resource: "User",
      resourceId: user._id.toString(),
    });

    return NextResponse.json({ message: "Password updated successfully." });
  } catch (error) {
    console.error("[Change Password Error]", error);
    return NextResponse.json({ error: "Failed to update password." }, { status: 500 });
  }
}
