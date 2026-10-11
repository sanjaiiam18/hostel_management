import { NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Notice from "@/models/Notice";
import { logAudit } from "@/lib/audit/service";

export async function PUT(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    await connectDB();
    const notice = await Notice.findByIdAndUpdate(
      params.id,
      { $set: body },
      { new: true }
    );

    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "NOTICE_UPDATED",
      resource: "Notice",
      resourceId: notice._id.toString(),
      details: { title: notice.title, status: notice.status },
    });

    return NextResponse.json({ message: "Notice updated", notice });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to update notice" }, { status: 500 });
  }
}

export async function DELETE(
  req: Request,
  { params }: { params: { id: string } }
) {
  try {
    const session = await requireAdmin();
    await connectDB();

    const notice = await Notice.findByIdAndDelete(params.id);
    if (!notice) {
      return NextResponse.json({ error: "Notice not found" }, { status: 404 });
    }

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "NOTICE_DELETED",
      resource: "Notice",
      resourceId: params.id,
    });

    return NextResponse.json({ message: "Notice deleted" });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    return NextResponse.json({ error: "Failed to delete notice" }, { status: 500 });
  }
}
