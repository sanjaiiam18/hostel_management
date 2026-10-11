import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import FoodFeedback from "@/models/FoodFeedback";
import { foodFeedbackSchema } from "@/lib/validations/operations";

export async function GET() {
  try {
    const session = await getSession();
    if (!session) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();

    // If Student: return their submitted feedbacks
    if (session.role === "student") {
      const myFeedbacks = await FoodFeedback.find({ studentId: session.userId })
        .sort({ date: -1, createdAt: -1 })
        .limit(20)
        .lean();
      return NextResponse.json({ feedbacks: myFeedbacks });
    }

    // If Admin/Warden: return aggregate ratings and anonymous student comments
    const allFeedback = await FoodFeedback.find().sort({ createdAt: -1 }).limit(100).lean();

    const count = allFeedback.length;
    let avgQuality = 0;
    let avgTaste = 0;
    let avgCleanliness = 0;

    if (count > 0) {
      avgQuality =
        allFeedback.reduce((acc, f) => acc + f.ratings.foodQuality, 0) / count;
      avgTaste =
        allFeedback.reduce((acc, f) => acc + f.ratings.taste, 0) / count;
      avgCleanliness =
        allFeedback.reduce((acc, f) => acc + f.ratings.cleanliness, 0) / count;
    }

    // Anonymous comments list protecting student identity
    const recentComments = allFeedback
      .filter((f) => f.comment && f.comment.trim().length > 0)
      .map((f) => ({
        id: f._id.toString(),
        mealType: f.mealType,
        date: f.date,
        ratings: f.ratings,
        comment: f.comment,
        submittedAt: f.createdAt,
      }));

    return NextResponse.json({
      stats: {
        totalResponses: count,
        avgQuality: Math.round(avgQuality * 10) / 10,
        avgTaste: Math.round(avgTaste * 10) / 10,
        avgCleanliness: Math.round(avgCleanliness * 10) / 10,
        overallRating:
          count > 0
            ? Math.round(((avgQuality + avgTaste + avgCleanliness) / 3) * 10) / 10
            : 0,
      },
      recentComments,
    });
  } catch (error) {
    console.error("[Get Food Feedback Error]", error);
    return NextResponse.json({ error: "Failed to fetch food feedback" }, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
    }

    const body = await req.json();
    const validated = foodFeedbackSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { mealType, date, foodQuality, taste, cleanliness, comment } = validated.data;

    await connectDB();

    // Check if feedback already submitted for this student, meal, and date
    const existing = await FoodFeedback.findOne({
      studentId: session.userId,
      mealType,
      date,
    });

    if (existing) {
      return NextResponse.json(
        { error: `You have already submitted feedback for ${mealType} on ${date}.` },
        { status: 409 }
      );
    }

    const feedback = await FoodFeedback.create({
      studentId: session.userId,
      mealType,
      date,
      ratings: {
        foodQuality,
        taste,
        cleanliness,
      },
      comment,
    });

    return NextResponse.json(
      { message: "Feedback submitted successfully! Thank you.", feedback },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Post Food Feedback Error]", error);
    return NextResponse.json({ error: "Failed to submit feedback." }, { status: 500 });
  }
}
