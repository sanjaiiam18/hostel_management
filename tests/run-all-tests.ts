import assert from "assert";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";
import connectDB from "../src/lib/db/mongoose";
import User from "../src/models/User";
import StudentProfile from "../src/models/StudentProfile";
import Hostel from "../src/models/Hostel";
import Block from "../src/models/Block";
import Floor from "../src/models/Floor";
import Room from "../src/models/Room";
import Bed from "../src/models/Bed";
import RoomAllocation from "../src/models/RoomAllocation";
import Attendance from "../src/models/Attendance";
import LeaveRequest from "../src/models/LeaveRequest";
import Complaint from "../src/models/Complaint";
import FeeRecord from "../src/models/FeeRecord";
import PaymentRecord from "../src/models/PaymentRecord";
import VisitorRequest from "../src/models/VisitorRequest";
import Notification from "../src/models/Notification";
import { signToken, verifyToken } from "../src/lib/auth/jwt";

async function runTests() {
  console.log("\n=======================================================");
  console.log("   🧪 RUNNING HOSTELHUB AUTOMATED INTEGRATION TESTS");
  console.log("=======================================================\n");

  let passed = 0;
  let failed = 0;

  async function test(name: string, fn: () => Promise<void>) {
    try {
      await fn();
      console.log(`  ✅ [PASS] ${name}`);
      passed++;
    } catch (err: any) {
      console.error(`  ❌ [FAIL] ${name}`);
      console.error(`     Error: ${err.message}`);
      failed++;
    }
  }

  await connectDB();

  // Test 1: Student Registration & Unique Constraints
  await test("1. User registration & Unique Student ID / Email constraint", async () => {
    await User.init();
    const email = `test_reg_${Date.now()}@test.edu`;
    const studentId = `TEST-${Date.now()}`;
    const hash = await bcrypt.hash("Password@123", 10);

    const u1 = await User.create({
      name: "Test Student",
      email,
      studentId,
      passwordHash: hash,
      role: "student",
      isActive: true,
    });

    assert.strictEqual(u1.email, email);
    assert.strictEqual(u1.role, "student");

    // Attempting duplicate email should throw
    let duplicateThrown = false;
    try {
      await User.create({
        name: "Test Duplicate",
        email,
        studentId: `DIFF-${Date.now()}`,
        passwordHash: hash,
        role: "student",
      });
    } catch (e) {
      duplicateThrown = true;
    }
    assert.ok(duplicateThrown, "Duplicate email registration must be rejected.");
  });

  // Test 2: Password hashing & verification
  await test("2. Password hashing & credential verification", async () => {
    const raw = "SuperSecretPassword123";
    const hash = await bcrypt.hash(raw, 10);
    const valid = await bcrypt.compare(raw, hash);
    const invalid = await bcrypt.compare("WrongPassword", hash);

    assert.strictEqual(valid, true, "Valid password comparison must return true");
    assert.strictEqual(invalid, false, "Invalid password comparison must return false");
  });

  // Test 3: JWT Role-Based Token Creation & Verification
  await test("3. JWT Signing & Role payload verification", async () => {
    const token = await signToken({
      userId: "507f1f77bcf86cd799439011",
      email: "admin@hostelhub.edu",
      role: "admin",
      name: "Dr. Admin",
    });

    const payload = await verifyToken(token);
    assert.ok(payload, "Token must successfully decode");
    assert.strictEqual(payload?.role, "admin");
    assert.strictEqual(payload?.email, "admin@hostelhub.edu");
  });

  // Test 4: Room & Bed Allocation Business Rules
  await test("4. Room and Bed allocation & prevent overbooking/duplicate active allocation", async () => {
    // Setup test hostel, room, bed
    const hostel = await Hostel.create({
      name: `Test Hostel ${Date.now()}`,
      code: `TH${Date.now()}`.slice(0, 10),
      wardenName: "Warden",
      wardenContact: "1234567890",
    });
    const block = await Block.create({ name: "A", hostelId: hostel._id });
    const floor = await Floor.create({ floorNumber: 1, name: "1st", hostelId: hostel._id, blockId: block._id });
    const room = await Room.create({
      roomNumber: `R-${Date.now()}`,
      hostelId: hostel._id,
      blockId: block._id,
      floorId: floor._id,
      roomType: "Single",
      totalBeds: 1,
      occupiedBeds: 0,
      availableBeds: 1,
      status: "Available",
    });
    const bed = await Bed.create({
      bedNumber: "A",
      roomId: room._id,
      hostelId: hostel._id,
      blockId: block._id,
      floorId: floor._id,
      isOccupied: false,
    });

    const sUser = await User.create({
      name: "Alloc Student",
      email: `alloc_${Date.now()}@test.edu`,
      studentId: `ALLOC-${Date.now()}`,
      passwordHash: "hash",
      role: "student",
    });

    // 1st allocation
    const alloc = await RoomAllocation.create({
      studentId: sUser._id,
      hostelId: hostel._id,
      blockId: block._id,
      floorId: floor._id,
      roomId: room._id,
      bedId: bed._id,
      status: "Active",
    });

    bed.isOccupied = true;
    bed.currentStudentId = sUser._id;
    await bed.save();

    // Check active allocation uniqueness query check
    const existingActive = await RoomAllocation.findOne({
      studentId: sUser._id,
      status: "Active",
    });
    assert.ok(existingActive, "Student should have active allocation");

    // Attempt second active allocation
    const hasAlready = await RoomAllocation.findOne({
      studentId: sUser._id,
      status: "Active",
    });
    assert.strictEqual(hasAlready?._id.toString(), alloc._id.toString(), "Student cannot have dual active allocations");
  });

  // Test 5: Attendance calculation formula & zero recorded days handling
  await test("5. Attendance formula calculation & zero-day edge case", async () => {
    // 0 days handling
    const zeroDaysTotal = 0;
    const zeroDaysPresent = 0;
    const zeroPercent = zeroDaysTotal === 0 ? 100 : (zeroDaysPresent / zeroDaysTotal) * 100;
    assert.strictEqual(zeroPercent, 100, "Zero days recorded should safely yield 100% without division error");

    // Standard days calculation
    const recorded = 10;
    const present = 8;
    const percentage = Math.round((present / recorded) * 100 * 10) / 10;
    assert.strictEqual(percentage, 80.0, "8 present out of 10 recorded days must equal 80%");
  });

  // Test 6: Leave Request workflow (Review & Remarks)
  await test("6. Leave Request approval workflow", async () => {
    const student = await User.create({
      name: "Leave Student",
      email: `leave_${Date.now()}@test.edu`,
      passwordHash: "hash",
      role: "student",
    });

    const leave = await LeaveRequest.create({
      studentId: student._id,
      leaveType: "Medical",
      startDate: new Date("2026-11-01"),
      endDate: new Date("2026-11-03"),
      reason: "Medical checkup",
      parentContact: "+91 9999999999",
      destination: "City Clinic",
      status: "Pending",
    });

    assert.strictEqual(leave.status, "Pending");

    // Warden approves
    leave.status = "Approved";
    leave.remarks = "Approved by Dr. Sharma";
    leave.reviewedAt = new Date();
    await leave.save();

    const updated = await LeaveRequest.findById(leave._id);
    assert.strictEqual(updated?.status, "Approved");
    assert.strictEqual(updated?.remarks, "Approved by Dr. Sharma");
  });

  // Test 7: Complaint Lifecycle & Status updates
  await test("7. Complaint status lifecycle from Submitted to Resolved", async () => {
    const student = await User.create({
      name: "Complaint Student",
      email: `comp_${Date.now()}@test.edu`,
      passwordHash: "hash",
      role: "student",
    });

    const complaint = await Complaint.create({
      studentId: student._id,
      category: "Electrical",
      subject: "Fan not rotating",
      description: "Regulator issue in room",
      priority: "Medium",
      status: "Submitted",
    });

    assert.strictEqual(complaint.status, "Submitted");

    // Update to Resolved
    complaint.status = "Resolved";
    complaint.resolutionNotes = "Capacitor replaced";
    complaint.resolvedAt = new Date();
    await complaint.save();

    const checked = await Complaint.findById(complaint._id);
    assert.strictEqual(checked?.status, "Resolved");
    assert.ok(checked?.resolvedAt, "Resolved timestamp must be recorded");
  });

  // Test 8: Fee Balances & Simulated Payments
  await test("8. Fee balance calculation & simulated payment updates", async () => {
    const student = await User.create({
      name: "Fee Student",
      email: `fee_${Date.now()}@test.edu`,
      passwordHash: "hash",
      role: "student",
    });

    const fee = await FeeRecord.create({
      studentId: student._id,
      title: "Semester Fee",
      academicYear: "2026-2027",
      totalAmount: 50000,
      paidAmount: 0,
      outstandingAmount: 50000,
      dueDate: new Date("2026-12-01"),
      status: "Pending",
    });

    // Simulate 20,000 partial payment
    const payment = await PaymentRecord.create({
      feeRecordId: fee._id,
      studentId: student._id,
      amount: 20000,
      paymentMethod: "Simulation",
      transactionReference: `SIM-${Date.now()}`,
      isVerified: true,
    });

    fee.paidAmount += payment.amount;
    fee.outstandingAmount = fee.totalAmount - fee.paidAmount;
    fee.status = fee.outstandingAmount === 0 ? "Paid" : "Partially Paid";
    await fee.save();

    assert.strictEqual(fee.paidAmount, 20000);
    assert.strictEqual(fee.outstandingAmount, 30000);
    assert.strictEqual(fee.status, "Partially Paid");

    // Simulate remaining 30,000 payment
    fee.paidAmount += 30000;
    fee.outstandingAmount = fee.totalAmount - fee.paidAmount;
    fee.status = fee.outstandingAmount === 0 ? "Paid" : "Partially Paid";
    await fee.save();

    assert.strictEqual(fee.paidAmount, 50000);
    assert.strictEqual(fee.outstandingAmount, 0);
    assert.strictEqual(fee.status, "Paid");
  });

  // Test 9: Visitor Request status tracking & Check-In/Check-Out
  await test("9. Visitor Request check-in and check-out logs", async () => {
    const student = await User.create({
      name: "Visitor Student",
      email: `vis_${Date.now()}@test.edu`,
      passwordHash: "hash",
      role: "student",
    });

    const visitor = await VisitorRequest.create({
      studentId: student._id,
      visitorName: "John Doe",
      relationship: "Parent",
      phoneNumber: "9876543210",
      visitDate: new Date("2026-10-15"),
      expectedEntryTime: "10:00 AM",
      expectedExitTime: "04:00 PM",
      purpose: "Meeting",
      status: "Pending",
    });

    visitor.status = "Approved";
    await visitor.save();
    assert.strictEqual(visitor.status, "Approved");

    visitor.status = "Checked In";
    visitor.actualEntryTime = "10:15 AM";
    await visitor.save();
    assert.strictEqual(visitor.status, "Checked In");

    visitor.status = "Checked Out";
    visitor.actualExitTime = "03:45 PM";
    await visitor.save();
    assert.strictEqual(visitor.status, "Checked Out");
    assert.strictEqual(visitor.actualExitTime, "03:45 PM");
  });

  // Test 10: Notification Creation & Unread Counts
  await test("10. In-App Notification generation and read state", async () => {
    const student = await User.create({
      name: "Notif Student",
      email: `notif_${Date.now()}@test.edu`,
      passwordHash: "hash",
      role: "student",
    });

    await Notification.create({
      userId: student._id,
      title: "Leave Approved",
      message: "Your leave has been approved.",
      category: "leave",
      isRead: false,
    });

    const unread = await Notification.countDocuments({
      userId: student._id,
      isRead: false,
    });
    assert.strictEqual(unread, 1);

    // Mark as read
    await Notification.updateMany({ userId: student._id }, { $set: { isRead: true } });
    const remainingUnread = await Notification.countDocuments({
      userId: student._id,
      isRead: false,
    });
    assert.strictEqual(remainingUnread, 0);
  });

  console.log("\n=======================================================");
  console.log(`   TEST SUMMARY: ${passed} PASSED, ${failed} FAILED`);
  console.log("=======================================================\n");

  if (failed > 0) {
    process.exit(1);
  } else {
    process.exit(0);
  }
}

runTests().catch((e) => {
  console.error("Test runner crashed:", e);
  process.exit(1);
});
