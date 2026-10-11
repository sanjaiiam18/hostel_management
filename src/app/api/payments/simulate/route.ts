import { NextResponse } from "next/server";
import crypto from "crypto";
import { getSession } from "@/lib/auth/session";
import connectDB from "@/lib/db/mongoose";
import FeeRecord from "@/models/FeeRecord";
import PaymentRecord from "@/models/PaymentRecord";
import { simulatedPaymentSchema } from "@/lib/validations/operations";
import { createNotification } from "@/lib/notifications/service";
import { logAudit } from "@/lib/audit/service";

export async function POST(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized. Student role required." }, { status: 401 });
    }

    const body = await req.json();
    const validated = simulatedPaymentSchema.safeParse(body);

    if (!validated.success) {
      return NextResponse.json(
        { error: "Validation failed", details: validated.error.flatten().fieldErrors },
        { status: 400 }
      );
    }

    const { feeRecordId, amount, notes } = validated.data;

    await connectDB();

    const fee = await FeeRecord.findById(feeRecordId);
    if (!fee) {
      return NextResponse.json({ error: "Fee record not found" }, { status: 404 });
    }

    // Ensure student owns this fee record
    if (fee.studentId.toString() !== session.userId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    if (fee.outstandingAmount <= 0) {
      return NextResponse.json(
        { error: "This fee invoice is already fully paid." },
        { status: 400 }
      );
    }

    if (amount > fee.outstandingAmount) {
      return NextResponse.json(
        { error: `Payment amount cannot exceed outstanding balance of ₹${fee.outstandingAmount}.` },
        { status: 400 }
      );
    }

    // Generate unique transaction reference clearly identified as demonstration
    const txnRef = `SIM-${Date.now()}-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;

    // Record payment
    const payment = await PaymentRecord.create({
      feeRecordId: fee._id,
      studentId: session.userId,
      amount,
      paymentMethod: "Simulation",
      transactionReference: txnRef,
      paymentDate: new Date(),
      isVerified: true,
      notes: notes || "Demonstration simulated payment",
    });

    // Update fee record balances consistently
    const newPaidAmount = fee.paidAmount + amount;
    const newOutstanding = Math.max(0, fee.totalAmount - newPaidAmount);
    fee.paidAmount = newPaidAmount;
    fee.outstandingAmount = newOutstanding;

    if (newOutstanding === 0) {
      fee.status = "Paid";
    } else {
      fee.status = "Partially Paid";
    }

    await fee.save();

    // Create confirmation notification
    await createNotification({
      userId: session.userId,
      title: "Simulated Payment Successful",
      message: `Simulated transaction ${txnRef} for ₹${amount.toLocaleString()} was successful. Remaining balance: ₹${newOutstanding.toLocaleString()}.`,
      category: "fee",
      linkUrl: "/student/fees",
    });

    // Audit log
    await logAudit({
      userId: session.userId,
      userEmail: session.email,
      action: "PAYMENT_SIMULATED",
      resource: "PaymentRecord",
      resourceId: payment._id.toString(),
      details: {
        feeRecordId: fee._id.toString(),
        amount,
        txnRef,
        remainingBalance: newOutstanding,
      },
    });

    return NextResponse.json(
      {
        message: "Payment successfully simulated and processed.",
        payment,
        updatedFee: fee,
      },
      { status: 201 }
    );
  } catch (error) {
    console.error("[Simulate Payment Error]", error);
    return NextResponse.json({ error: "Failed to process simulated payment" }, { status: 500 });
  }
}
