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
import Notice from "../src/models/Notice";
import MessMenu from "../src/models/MessMenu";
import FoodFeedback from "../src/models/FoodFeedback";
import FeeRecord from "../src/models/FeeRecord";
import PaymentRecord from "../src/models/PaymentRecord";
import VisitorRequest from "../src/models/VisitorRequest";
import EmergencyContact from "../src/models/EmergencyContact";
import Notification from "../src/models/Notification";
import AuditLog from "../src/models/AuditLog";

async function seed() {
  console.log("🌱 [Seed] Connecting to MongoDB database...");
  await connectDB();

  console.log("🧹 [Seed] Clearing existing test data collections...");
  await Promise.all([
    User.deleteMany({}),
    StudentProfile.deleteMany({}),
    Hostel.deleteMany({}),
    Block.deleteMany({}),
    Floor.deleteMany({}),
    Room.deleteMany({}),
    Bed.deleteMany({}),
    RoomAllocation.deleteMany({}),
    Attendance.deleteMany({}),
    LeaveRequest.deleteMany({}),
    Complaint.deleteMany({}),
    Notice.deleteMany({}),
    MessMenu.deleteMany({}),
    FoodFeedback.deleteMany({}),
    FeeRecord.deleteMany({}),
    PaymentRecord.deleteMany({}),
    VisitorRequest.deleteMany({}),
    EmergencyContact.deleteMany({}),
    Notification.deleteMany({}),
    AuditLog.deleteMany({}),
  ]);

  console.log("👤 [Seed] Generating passwords...");
  const adminPasswordHash = await bcrypt.hash("Admin@123", 10);
  const studentPasswordHash = await bcrypt.hash("Student@123", 10);

  // 1. Create Admin / Warden
  const adminUser = await User.create({
    name: "Dr. Rajesh Sharma",
    email: "admin@hostelhub.edu",
    passwordHash: adminPasswordHash,
    role: "admin",
    phone: "+91 98765 00001",
    isActive: true,
  });

  // 2. Create Students
  const student1 = await User.create({
    name: "Aarav Mehta",
    email: "student1@hostelhub.edu",
    studentId: "STU-2026-001",
    passwordHash: studentPasswordHash,
    role: "student",
    phone: "+91 98765 11001",
    isActive: true,
  });

  const student2 = await User.create({
    name: "Priya Nair",
    email: "student2@hostelhub.edu",
    studentId: "STU-2026-002",
    passwordHash: studentPasswordHash,
    role: "student",
    phone: "+91 98765 11002",
    isActive: true,
  });

  const student3 = await User.create({
    name: "Rohan Varma",
    email: "student3@hostelhub.edu",
    studentId: "STU-2026-003",
    passwordHash: studentPasswordHash,
    role: "student",
    phone: "+91 98765 11003",
    isActive: true,
  });

  const student4 = await User.create({
    name: "Ananya Iyer",
    email: "student4@hostelhub.edu",
    studentId: "STU-2026-004",
    passwordHash: studentPasswordHash,
    role: "student",
    phone: "+91 98765 11004",
    isActive: true,
  });

  // 3. Create Hostels
  const boysHostel = await Hostel.create({
    name: "Himalaya Boys Hostel",
    code: "HBH",
    type: "boys",
    wardenName: "Dr. Rajesh Sharma",
    wardenContact: "+91 98765 00001",
    totalCapacity: 120,
    description: "Multi-story residential complex for senior undergraduate and postgraduate engineering men.",
  });

  const girlsHostel = await Hostel.create({
    name: "Nilgiri Girls Hostel",
    code: "NGH",
    type: "girls",
    wardenName: "Dr. Sunita Rao",
    wardenContact: "+91 98765 00002",
    totalCapacity: 100,
    description: "Modern campus hostel facility with dedicated study rooms and indoor sports amenities.",
  });

  // 4. Create Blocks & Floors
  const blockA = await Block.create({
    name: "A",
    hostelId: boysHostel._id,
    description: "North Wing",
  });
  const blockB = await Block.create({
    name: "B",
    hostelId: girlsHostel._id,
    description: "Garden Facing Wing",
  });

  const floor1A = await Floor.create({
    floorNumber: 1,
    name: "Ground Floor",
    hostelId: boysHostel._id,
    blockId: blockA._id,
  });
  const floor2A = await Floor.create({
    floorNumber: 2,
    name: "Second Floor",
    hostelId: boysHostel._id,
    blockId: blockA._id,
  });

  const floor1B = await Floor.create({
    floorNumber: 1,
    name: "First Floor",
    hostelId: girlsHostel._id,
    blockId: blockB._id,
  });
  const floor2B = await Floor.create({
    floorNumber: 2,
    name: "Second Floor",
    hostelId: girlsHostel._id,
    blockId: blockB._id,
  });

  // 5. Create Rooms and Beds
  // Room 101 (Double) in Boys Hostel
  const room101 = await Room.create({
    roomNumber: "101",
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    roomType: "Double",
    totalBeds: 2,
    occupiedBeds: 2,
    availableBeds: 0,
    status: "Full",
    facilities: ["Attached Bathroom", "High-speed Wi-Fi", "Balcony View", "Ceiling Fan", "Study Desk"],
  });

  const bed101A = await Bed.create({
    bedNumber: "A",
    roomId: room101._id,
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    isOccupied: true,
    currentStudentId: student1._id,
  });

  const bed101B = await Bed.create({
    bedNumber: "B",
    roomId: room101._id,
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    isOccupied: true,
    currentStudentId: student3._id,
  });

  // Room 102 (Double) in Boys Hostel (Available)
  const room102 = await Room.create({
    roomNumber: "102",
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    roomType: "Double",
    totalBeds: 2,
    occupiedBeds: 0,
    availableBeds: 2,
    status: "Available",
    facilities: ["Attached Bathroom", "High-speed Wi-Fi", "Study Desk"],
  });
  await Bed.create({
    bedNumber: "A",
    roomId: room102._id,
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    isOccupied: false,
  });
  await Bed.create({
    bedNumber: "B",
    roomId: room102._id,
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    isOccupied: false,
  });

  // Room 201 (Double) in Girls Hostel (Partially Occupied)
  const room201Girls = await Room.create({
    roomNumber: "201",
    hostelId: girlsHostel._id,
    blockId: blockB._id,
    floorId: floor2B._id,
    roomType: "Double",
    totalBeds: 2,
    occupiedBeds: 1,
    availableBeds: 1,
    status: "Partially Occupied",
    facilities: ["Attached Bathroom", "Balcony", "Study Desk", "Wi-Fi"],
  });
  const bed201GA = await Bed.create({
    bedNumber: "A",
    roomId: room201Girls._id,
    hostelId: girlsHostel._id,
    blockId: blockB._id,
    floorId: floor2B._id,
    isOccupied: true,
    currentStudentId: student2._id,
  });
  const bed201GB = await Bed.create({
    bedNumber: "B",
    roomId: room201Girls._id,
    hostelId: girlsHostel._id,
    blockId: blockB._id,
    floorId: floor2B._id,
    isOccupied: false,
  });

  // 6. Create Student Profiles
  await StudentProfile.create({
    userId: student1._id,
    studentId: student1.studentId,
    department: "Computer Science",
    academicYear: "Year 3",
    gender: "Male",
    bloodGroup: "O+",
    address: "Flat 402, Royal Palms, Pune, Maharashtra 411001",
    guardianName: "Mahesh Mehta",
    guardianPhone: "+91 98220 12345",
    guardianRelation: "Father",
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    roomId: room101._id,
    bedId: bed101A._id,
    isAllocated: true,
  });

  await StudentProfile.create({
    userId: student2._id,
    studentId: student2.studentId,
    department: "Biotechnology",
    academicYear: "Year 2",
    gender: "Female",
    bloodGroup: "B+",
    address: "24 Park Avenue, Kochi, Kerala 682001",
    guardianName: "Suresh Nair",
    guardianPhone: "+91 94470 54321",
    guardianRelation: "Father",
    hostelId: girlsHostel._id,
    blockId: blockB._id,
    floorId: floor2B._id,
    roomId: room201Girls._id,
    bedId: bed201GA._id,
    isAllocated: true,
  });

  await StudentProfile.create({
    userId: student3._id,
    studentId: student3.studentId,
    department: "Mechanical Eng",
    academicYear: "Year 4",
    gender: "Male",
    bloodGroup: "A+",
    address: "12 Sector 15, Chandigarh 160015",
    guardianName: "Vikram Varma",
    guardianPhone: "+91 98140 99887",
    guardianRelation: "Father",
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    roomId: room101._id,
    bedId: bed101B._id,
    isAllocated: true,
  });

  // Student 4 is deliberately unallocated for review demo!
  await StudentProfile.create({
    userId: student4._id,
    studentId: student4.studentId,
    department: "Electrical Eng",
    academicYear: "Year 1",
    gender: "Female",
    bloodGroup: "AB+",
    address: "55 Gandhi Road, Chennai, Tamil Nadu 600001",
    guardianName: "K. Iyer",
    guardianPhone: "+91 98400 11223",
    guardianRelation: "Father",
    isAllocated: false,
  });

  // 7. Active Allocations
  await RoomAllocation.create({
    studentId: student1._id,
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    roomId: room101._id,
    bedId: bed101A._id,
    status: "Active",
    allocatedBy: adminUser._id,
    remarks: "Regular academic allocation",
  });
  await RoomAllocation.create({
    studentId: student2._id,
    hostelId: girlsHostel._id,
    blockId: blockB._id,
    floorId: floor2B._id,
    roomId: room201Girls._id,
    bedId: bed201GA._id,
    status: "Active",
    allocatedBy: adminUser._id,
    remarks: "Regular academic allocation",
  });
  await RoomAllocation.create({
    studentId: student3._id,
    hostelId: boysHostel._id,
    blockId: blockA._id,
    floorId: floor1A._id,
    roomId: room101._id,
    bedId: bed101B._id,
    status: "Active",
    allocatedBy: adminUser._id,
    remarks: "Regular academic allocation",
  });

  // 8. Attendance Records (10 days)
  const dates = [
    "2026-10-01",
    "2026-10-02",
    "2026-10-03",
    "2026-10-04",
    "2026-10-05",
    "2026-10-06",
    "2026-10-07",
    "2026-10-08",
    "2026-10-09",
    "2026-10-10",
  ];

  for (let i = 0; i < dates.length; i++) {
    const d = dates[i];
    await Attendance.create({
      studentId: student1._id,
      date: d,
      status: i === 6 ? "Absent" : "Present", // 90% attendance for student 1
      markedBy: adminUser._id,
      remarks: i === 6 ? "Approved weekend leave" : "Present at 9:00 PM roll call",
    });

    await Attendance.create({
      studentId: student2._id,
      date: d,
      status: "Present",
      markedBy: adminUser._id,
    });

    await Attendance.create({
      studentId: student3._id,
      date: d,
      status: i % 4 === 0 ? "Absent" : "Present",
      markedBy: adminUser._id,
    });
  }

  // 9. Leave Requests
  await LeaveRequest.create({
    studentId: student1._id,
    leaveType: "Home",
    startDate: new Date("2026-10-15"),
    endDate: new Date("2026-10-18"),
    reason: "Visiting family for Diwali festival celebrations.",
    destination: "Pune, Maharashtra",
    parentContact: "+91 98220 12345",
    status: "Pending",
  });

  await LeaveRequest.create({
    studentId: student1._id,
    leaveType: "Medical",
    startDate: new Date("2026-09-20"),
    endDate: new Date("2026-09-22"),
    reason: "Dental surgery appointment in hometown clinic.",
    destination: "Pune, Maharashtra",
    parentContact: "+91 98220 12345",
    status: "Approved",
    reviewedBy: adminUser._id,
    reviewedAt: new Date("2026-09-19"),
    remarks: "Medical prescription verified. Permitted.",
  });

  await LeaveRequest.create({
    studentId: student3._id,
    leaveType: "Personal",
    startDate: new Date("2026-10-20"),
    endDate: new Date("2026-10-22"),
    reason: "Attending cousin's wedding ceremony.",
    destination: "Chandigarh",
    parentContact: "+91 98140 99887",
    status: "Pending",
  });

  // 10. Complaints
  await Complaint.create({
    studentId: student1._id,
    category: "Electrical",
    subject: "Geyser tripping MCB switch in Bathroom 101",
    description: "Whenever the water heater is switched on, the main circuit breaker trips after 2 minutes.",
    priority: "High",
    status: "In Progress",
    assignedTo: "Electrician Ramesh (Ext 402)",
    resolutionNotes: "Element inspected; replacement coil dispatched from central store.",
  });

  await Complaint.create({
    studentId: student2._id,
    category: "Plumbing",
    subject: "Slow drainage in washbasin",
    description: "Washbasin pipe clogged on 2nd floor Room 201.",
    priority: "Medium",
    status: "Resolved",
    assignedTo: "Plumber Satish",
    resolutionNotes: "P-trap cleared and cleaned. Drainage normal.",
    resolvedAt: new Date("2026-10-08"),
    reviewedBy: adminUser._id,
  });

  await Complaint.create({
    studentId: student3._id,
    category: "Wi-Fi",
    subject: "Weak signal on 1st floor corridor router",
    description: "Router drops connection during peak study hours between 8 PM and 11 PM.",
    priority: "Urgent",
    status: "Submitted",
  });

  // 11. Notices
  await Notice.create({
    title: "Urgent Campus Water Pipeline Maintenance Alert",
    description: "Municipal pipeline repair scheduled tomorrow from 1:00 PM to 4:00 PM. Hostels will be switched to emergency reserve overhead tanks. Please conserve water accordingly.",
    category: "Emergency",
    priority: "Emergency",
    author: "Hostel Chief Warden Office",
    authorRole: "Administrator",
    status: "Published",
    publicationDate: new Date("2026-10-10"),
  });

  await Notice.create({
    title: "Hostel Gate Timings & Night Biometric Roll-Call Notice",
    description: "All hostel residents must check into their respective blocks before 9:30 PM. The main campus gate closes strictly at 10:00 PM. Night attendance roll-call begins at 9:45 PM.",
    category: "Hostel",
    priority: "Important",
    author: "Warden Office",
    status: "Published",
    publicationDate: new Date("2026-10-05"),
  });

  await Notice.create({
    title: "Inter-Hostel Sports Tournament 2026 Registration Open",
    description: "Entries are open for Badminton, Volleyball, Chess, and Table Tennis competitions starting next weekend. Submit team lists at the sports office.",
    category: "General",
    priority: "Normal",
    author: "Sports Committee",
    status: "Published",
    publicationDate: new Date("2026-10-02"),
  });

  // 12. Weekly Mess Menu
  await MessMenu.create({
    title: "Fall Term Weekly Dining Schedule",
    weekNumber: 41,
    year: 2026,
    status: "Published",
    schedule: {
      monday: {
        breakfast: "Poha, Boiled Eggs / Sprout Salad, Tea & Filter Coffee",
        lunch: "Rajma Masala, Steamed Basmati Rice, Chapati, Boondi Raita & Fresh Salad",
        snacks: "Aloo Bonda with Green Chutney, Ginger Tea",
        dinner: "Paneer Lababdar, Dal Fry, Jeera Rice, Tandoori Roti & Fruit Custard",
      },
      tuesday: {
        breakfast: "South Indian Idli, Medu Vada, Sambar, Coconut Chutney & Tea",
        lunch: "Kadhi Pakora, Jeera Rice, Phulka, Aloo Gobi & Mix Pickle",
        snacks: "Veg Puff / Cookies with Masala Tea",
        dinner: "Mix Veg Curry, Dal Tadka, Steamed Rice, Butter Roti & Kheer",
      },
      wednesday: {
        breakfast: "Aloo Paratha with White Butter, Curd & Masala Tea",
        lunch: "Chole Masala, Bhature / Poori, Jeera Rice, Onion Salad & Buttermilk",
        snacks: "Sweet Corn Chaat & Lemon Tea",
        dinner: "Butter Chicken / Shahi Paneer, Dal Makhani, Pulao, Naan & Ice Cream",
      },
      thursday: {
        breakfast: "Upma, Kesari Bath, Coconut Chutney, Boiled Eggs & Coffee",
        lunch: "Dal Palak, Aloo Shimla Mirch, Steamed Rice, Chapati & Dahi",
        snacks: "Samosa with Sweet Tamarind Chutney & Tea",
        dinner: "Kadhai Paneer, Yellow Dal, Veg Biryani, Phulka & Rasgulla",
      },
      friday: {
        breakfast: "Uttapam, Tomato Onion Chutney, Sambar & Tea",
        lunch: "Egg Curry / Malai Kofta, Dal Tadka, Peas Pulao, Chapati & Salad",
        snacks: "Pani Puri / Bhel Puri & Cold Lemon Drink",
        dinner: "Matar Paneer, Dal Fry, Steamed Rice, Missi Roti & Gulab Jamun",
      },
      saturday: {
        breakfast: "Masala Dosa, Potato Masala, Sambar, Chutney & Coffee",
        lunch: "Dal Khichdi, Gujarati Kadhi, Aloo Methi, Papad & Pickle",
        snacks: "Bread Pakora with Chutney & Tea",
        dinner: "Pav Bhaji, Extra Butter Toasted Pav, Pulao & Kulfi",
      },
      sunday: {
        breakfast: "Puri Bhaji with Halwa, Sprouted Green Moong & Filter Coffee",
        lunch: "Special Hyderabadi Dum Biryani (Veg/Chicken), Mirchi Ka Salan, Raita",
        snacks: "French Fries / Biscuits & Masala Tea",
        dinner: "Light Khichdi / Phulka with Moong Dal & Seasonal Fresh Fruit",
      },
    },
  });

  // 13. Food Feedback
  await FoodFeedback.create({
    studentId: student1._id,
    mealType: "Lunch",
    date: "2026-10-09",
    ratings: { foodQuality: 5, taste: 5, cleanliness: 4 },
    comment: "Rajma chawal was delicious and properly seasoned today!",
  });
  await FoodFeedback.create({
    studentId: student2._id,
    mealType: "Breakfast",
    date: "2026-10-10",
    ratings: { foodQuality: 4, taste: 4, cleanliness: 5 },
    comment: "Idli was very soft and sambar was piping hot.",
  });

  // 14. Fee Records and Payments
  const fee1 = await FeeRecord.create({
    studentId: student1._id,
    title: "Hostel Maintenance & Mess Dues - Fall 2026",
    academicYear: "2026-2027",
    semester: "Semester 1",
    totalAmount: 48000,
    paidAmount: 24000,
    outstandingAmount: 24000,
    dueDate: new Date("2026-11-15"),
    status: "Partially Paid",
    remarks: "First installment settled",
  });

  await PaymentRecord.create({
    feeRecordId: fee1._id,
    studentId: student1._id,
    amount: 24000,
    paymentMethod: "Simulation",
    transactionReference: "SIM-2026-TXN-001928",
    paymentDate: new Date("2026-09-01"),
    isVerified: true,
    notes: "Demonstration online simulated payment",
  });

  const fee2 = await FeeRecord.create({
    studentId: student2._id,
    title: "Hostel Maintenance & Mess Dues - Fall 2026",
    academicYear: "2026-2027",
    semester: "Semester 1",
    totalAmount: 48000,
    paidAmount: 48000,
    outstandingAmount: 0,
    dueDate: new Date("2026-11-15"),
    status: "Paid",
  });

  await PaymentRecord.create({
    feeRecordId: fee2._id,
    studentId: student2._id,
    amount: 48000,
    paymentMethod: "Simulation",
    transactionReference: "SIM-2026-TXN-001929",
    paymentDate: new Date("2026-08-28"),
    isVerified: true,
  });

  await FeeRecord.create({
    studentId: student3._id,
    title: "Hostel Maintenance & Mess Dues - Fall 2026",
    academicYear: "2026-2027",
    semester: "Semester 1",
    totalAmount: 48000,
    paidAmount: 0,
    outstandingAmount: 48000,
    dueDate: new Date("2026-11-15"),
    status: "Pending",
  });

  // 15. Visitor Requests
  await VisitorRequest.create({
    studentId: student1._id,
    visitorName: "Mahesh Mehta",
    relationship: "Parent",
    phoneNumber: "+91 98220 12345",
    visitDate: new Date("2026-10-12"),
    expectedEntryTime: "11:00 AM",
    expectedExitTime: "04:30 PM",
    purpose: "Delivering winter clothes and family visit.",
    status: "Approved",
    reviewedBy: adminUser._id,
    remarks: "Authorized visitor. Verified at security desk.",
  });

  await VisitorRequest.create({
    studentId: student3._id,
    visitorName: "Sunil Varma",
    relationship: "Relative",
    phoneNumber: "+91 98140 11223",
    visitDate: new Date("2026-10-14"),
    expectedEntryTime: "02:00 PM",
    expectedExitTime: "06:00 PM",
    purpose: "Casual weekend visit.",
    status: "Pending",
  });

  // 16. Emergency Contacts
  await EmergencyContact.create([
    {
      name: "Campus Security Control Room",
      category: "Security",
      phoneNumber: "+91 98765 00100",
      location: "Main Gate Gatehouse",
      availability: "24/7 Available",
      order: 1,
    },
    {
      name: "Chief Warden Dr. Rajesh Sharma",
      category: "Warden",
      phoneNumber: "+91 98765 00001",
      location: "Warden Residence, Block A",
      availability: "24/7 On-Call",
      order: 2,
    },
    {
      name: "Campus Health Center / Ambulance",
      category: "Ambulance",
      phoneNumber: "+91 98765 00108",
      location: "Student Health Center",
      availability: "24/7 Emergency Dispatch",
      order: 3,
    },
    {
      name: "Local Police Station (Civil Lines)",
      category: "Police",
      phoneNumber: "112",
      location: "Station 5, Campus Perimeter",
      availability: "24/7 Emergency",
      order: 4,
    },
    {
      name: "City Fire & Emergency Services",
      category: "Fire Service",
      phoneNumber: "101",
      location: "Municipal Fire Station #2",
      availability: "24/7 Emergency",
      order: 5,
    },
    {
      name: "Hostel Administration & Estate Office",
      category: "Hostel Office",
      phoneNumber: "+91 98765 00110",
      location: "Administrative Block, 1st Floor",
      availability: "Mon-Sat: 9 AM - 6 PM",
      order: 6,
    },
  ]);

  // 17. Initial Notifications for Student 1
  await Notification.create([
    {
      userId: student1._id,
      title: "Visitor Request Approved",
      message: "Visitor pass for Mahesh Mehta has been approved for Oct 12, 2026.",
      category: "visitor",
      linkUrl: "/student/visitors",
      isRead: false,
    },
    {
      userId: student1._id,
      title: "Maintenance In Progress",
      message: "Electrician Ramesh has been dispatched for Ticket #Geyser MCB trip.",
      category: "complaint",
      linkUrl: "/student/complaints",
      isRead: false,
    },
    {
      userId: student1._id,
      title: "Emergency Water Alert Published",
      message: "Please note the water maintenance schedule between 1 PM and 4 PM tomorrow.",
      category: "emergency",
      linkUrl: "/student/notices",
      isRead: true,
    },
  ]);

  // 18. Audit Logs
  await AuditLog.create([
    {
      userId: adminUser._id,
      userEmail: adminUser.email,
      action: "ROOM_ALLOCATED",
      resource: "RoomAllocation",
      details: { student: "Aarav Mehta", room: "101", bed: "A" },
    },
    {
      userId: adminUser._id,
      userEmail: adminUser.email,
      action: "NOTICE_CREATED",
      resource: "Notice",
      details: { title: "Urgent Campus Water Pipeline Maintenance Alert", priority: "Emergency" },
    },
    {
      userId: adminUser._id,
      userEmail: adminUser.email,
      action: "VISITOR_STATUS_UPDATED",
      resource: "VisitorRequest",
      details: { status: "Approved", visitorName: "Mahesh Mehta" },
    },
  ]);

  console.log("✅ [Seed] Database successfully populated with realistic institutional demo records!");
  console.log("\n=======================================================");
  console.log("   DEMO CREDENTIALS FOR TESTING & REVIEW");
  console.log("=======================================================");
  console.log("👤 Administrator / Warden Account:");
  console.log("   Email:    admin@hostelhub.edu");
  console.log("   Password: Admin@123");
  console.log("-------------------------------------------------------");
  console.log("🎓 Student Account (Allocated, with Leaves & Fees):");
  console.log("   Email:    student1@hostelhub.edu  (or ID: STU-2026-001)");
  console.log("   Password: Student@123");
  console.log("-------------------------------------------------------");
  console.log("🎓 Student Account (Unallocated - test bed allocation):");
  console.log("   Email:    student4@hostelhub.edu  (or ID: STU-2026-004)");
  console.log("   Password: Student@123");
  console.log("=======================================================\n");

  process.exit(0);
}

seed().catch((err) => {
  console.error("❌ [Seed Error]", err);
  process.exit(1);
});
