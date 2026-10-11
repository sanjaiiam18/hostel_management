import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import Notice from "@/models/Notice";
import User from "@/models/User";
import { noticeSchema } from "@/lib/validations/operations";
import { createNotification } from "@/lib/notifications/service";
import { logAudit } from "@/lib/audit/service";

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const priority = searchParams.get("priority");
    const search = searchParams.get("search");

    await connectDB();

    const query: any = {};
    if (session.role === "student") {
      query.status = "Published";
      // Exclude expired notices
      query.$or = [
        { expirationDate: { $exists: false } },
        { expirationDate: null },
        { expirationDate: { $gt: new Date() } },
      ];
    }

    if (category && category !== "ALL") query.category = category;
    if (priority && priority !== "ALL") query.priority = priority;
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { description: { $regex: search, $options: "i" } },
      ];
    }

    const notices = await Notice.find(query).sort({ priority: -1, publicationDate: -1 }).lean();

    return NextResponse.json({ notices });
  } catch (error) {
    console.error("[Get Notices Error]", error);
    return NextResponse.json({ error: "Failed to fetch notices" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();
    const validated = noticeSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { title, description, category, priority, expirationDate, status } = validated.data;

    await connectDB();

    const notice = await Notice.create({
      title,
      description,
      category,
      priority,
      expirationDate: expirationDate ? new Date(expirationDate) : undefined,
      author: session.name || "Warden Office",
      authorRole: session.role === "admin" ? "Administrator" : "Warden",
      status: status || "Published",
      publicationDate: new Date(),
    });

    // If emergency priority or published notice, send notifications
    if (priority === "Emergency" || status === "Published") {
      const activeStudents = await User.find({ role: "student", isActive: true })
        .select("_id")
        .lean();

      // Batch create notifications for active students
      for (const s of activeStudents) {
        await createNotification({
          userId: s._id,
          title: priority === "Emergency" ? `🚨 EMERGENCY: ${title}` : `📢 Notice: ${title}`,
          message: description.slice(0, 150) + (description.length > 150 ? "..." : ""),
          category: priority === "Emergency" ? "emergency" : "notice",
          linkUrl: "/student/notices",
        });
      }
    }

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "NOTICE_CREATED",
      resource: "Notice",
      resourceId: notice._id.toString(),
      details: { title, category, priority },
    });

    return NextResponse.json({ message: "Notice published successfully", notice }, { status: 201 });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Create Notice Error]", error);
    return NextResponse.json({ error: "Failed to create notice" }, { status: 500 });
  }
}
