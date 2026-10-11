import { z } from "zod";

export const profileUpdateSchema = z.object({
  phone: z.string().optional(),
  address: z.string().optional(),
  bloodGroup: z.string().optional(),
  guardianName: z.string().optional(),
  guardianPhone: z.string().optional(),
  guardianRelation: z.string().optional(),
});

export const leaveRequestSchema = z
  .object({
    leaveType: z.enum(["Home", "Medical", "Personal", "Other"]),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    reason: z.string().min(5, "Reason must be at least 5 characters").max(500),
    parentContact: z.string().min(10, "Valid parent/guardian contact is required"),
    destination: z.string().min(2, "Destination is required").max(150),
  })
  .refine(
    (data) => new Date(data.endDate).getTime() >= new Date(data.startDate).getTime(),
    {
      message: "End date must be on or after start date",
      path: ["endDate"],
    }
  );

export const reviewLeaveSchema = z.object({
  status: z.enum(["Approved", "Rejected"]),
  remarks: z.string().optional(),
});

export const complaintSchema = z.object({
  category: z.enum([
    "Electrical",
    "Plumbing",
    "Food",
    "Room",
    "Cleaning",
    "Wi-Fi",
    "Security",
    "Other",
  ]),
  subject: z.string().min(3, "Subject must be at least 3 characters").max(150),
  description: z.string().min(10, "Description must be at least 10 characters").max(1000),
  priority: z.enum(["Low", "Medium", "High", "Urgent"]).default("Medium"),
  attachmentUrl: z.string().optional(),
});

export const updateComplaintSchema = z.object({
  status: z.enum(["Submitted", "Under Review", "In Progress", "Resolved", "Rejected"]),
  assignedTo: z.string().optional(),
  resolutionNotes: z.string().optional(),
});

export const noticeSchema = z.object({
  title: z.string().min(3, "Title must be at least 3 characters").max(200),
  description: z.string().min(10, "Description must be at least 10 characters"),
  category: z.enum([
    "General",
    "Academic",
    "Hostel",
    "Emergency",
    "Mess",
    "Maintenance",
  ]),
  priority: z.enum(["Normal", "Important", "Emergency"]),
  expirationDate: z.string().optional(),
  status: z.enum(["Draft", "Published", "Archived"]).default("Published"),
});

export const visitorRequestSchema = z.object({
  visitorName: z.string().min(2, "Visitor name is required"),
  relationship: z.string().min(2, "Relationship is required"),
  phoneNumber: z.string().min(10, "Valid phone number is required"),
  visitDate: z.string().min(1, "Visit date is required"),
  expectedEntryTime: z.string().min(1, "Expected entry time is required"),
  expectedExitTime: z.string().min(1, "Expected exit time is required"),
  purpose: z.string().min(3, "Purpose of visit is required"),
});

export const reviewVisitorSchema = z.object({
  status: z.enum(["Pending", "Approved", "Rejected", "Checked In", "Checked Out"]),
  actualEntryTime: z.string().optional(),
  actualExitTime: z.string().optional(),
  remarks: z.string().optional(),
});

export const foodFeedbackSchema = z.object({
  mealType: z.enum(["Breakfast", "Lunch", "Snacks", "Dinner"]),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  foodQuality: z.number().min(1).max(5),
  taste: z.number().min(1).max(5),
  cleanliness: z.number().min(1).max(5),
  comment: z.string().max(500).optional(),
});

export const allocationSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  hostelId: z.string().min(1, "Hostel is required"),
  blockId: z.string().min(1, "Block is required"),
  floorId: z.string().min(1, "Floor is required"),
  roomId: z.string().min(1, "Room is required"),
  bedId: z.string().min(1, "Bed is required"),
  remarks: z.string().optional(),
});

export const attendanceMarkSchema = z.object({
  studentId: z.string().min(1, "Student ID is required"),
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  status: z.enum(["Present", "Absent"]),
  remarks: z.string().optional(),
});

export const bulkAttendanceSchema = z.object({
  date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, "Date must be YYYY-MM-DD"),
  records: z.array(
    z.object({
      studentId: z.string(),
      status: z.enum(["Present", "Absent"]),
      remarks: z.string().optional(),
    })
  ),
});

export const feeRecordSchema = z.object({
  studentId: z.string().min(1, "Student is required"),
  title: z.string().min(3, "Fee title is required"),
  academicYear: z.string().min(1, "Academic year is required"),
  semester: z.string().optional(),
  totalAmount: z.number().min(1, "Amount must be greater than zero"),
  dueDate: z.string().min(1, "Due date is required"),
  remarks: z.string().optional(),
});

export const simulatedPaymentSchema = z.object({
  feeRecordId: z.string().min(1, "Fee record is required"),
  amount: z.number().min(1, "Payment amount must be greater than zero"),
  notes: z.string().optional(),
});
