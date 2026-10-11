import { NextResponse } from "next/server";
import { getSession, requireAdmin } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import MessMenu from "@/models/MessMenu";
import { logAudit } from "@/lib/audit/service";

// Helper to get ISO week number
function getWeekNumber(d: Date): number {
  const date = new Date(Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()));
  const dayNum = date.getUTCDay() || 7;
  date.setUTCDate(date.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(date.getUTCFullYear(), 0, 1));
  return Math.ceil(((date.getTime() - yearStart.getTime()) / 86400000 + 1) / 7);
}

export async function GET(req: Request) {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const currentDate = new Date();
    const week = parseInt(searchParams.get("week") || getWeekNumber(currentDate).toString(), 10);
    const year = parseInt(searchParams.get("year") || currentDate.getFullYear().toString(), 10);

    await connectDB();

    let menu = await MessMenu.findOne({ weekNumber: week, year }).lean();

    if (!menu) {
      // Fallback to the latest published menu if specific week is not found
      menu = await MessMenu.findOne({ status: "Published" })
        .sort({ year: -1, weekNumber: -1 })
        .lean();
    }

    return NextResponse.json({
      menu,
      currentWeek: getWeekNumber(currentDate),
      currentYear: currentDate.getFullYear(),
    });
  } catch (error) {
    console.error("[Get Mess Menu Error]", error);
    return NextResponse.json({ error: "Failed to fetch mess menu" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await requireAdmin();
    const body = await req.json();

    const { title, weekNumber, year, schedule, status } = body;

    if (!title || !weekNumber || !year || !schedule) {
      return NextResponse.json({ error: "Missing required menu schedule fields" }, { status: 400 });
    }

    await connectDB();

    const menu = await MessMenu.findOneAndUpdate(
      { weekNumber, year },
      {
        $set: {
          title,
          schedule,
          status: status || "Published",
        },
      },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "MESS_MENU_UPDATED",
      resource: "MessMenu",
      resourceId: menu._id.toString(),
      details: { weekNumber, year, title },
    });

    return NextResponse.json({ message: "Mess menu saved successfully", menu });
  } catch (error: any) {
    if (error.message === "FORBIDDEN" || error.message === "UNAUTHORIZED") {
      return NextResponse.json({ error: "Access denied" }, { status: 403 });
    }
    console.error("[Post Mess Menu Error]", error);
    return NextResponse.json({ error: "Failed to save mess menu" }, { status: 500 });
  }
}
