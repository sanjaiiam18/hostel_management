# 🏢 HostelHub — Application-Based Hostel Management System for Educational Institutions

[![Next.js](https://img.shields.io/badge/Next.js-14.2.15-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-3.4-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![MongoDB](https://img.shields.io/badge/MongoDB-Mongoose_9-green?style=flat-square&logo=mongodb)](https://www.mongodb.com/)
[![License](https://img.shields.io/badge/License-MIT-purple?style=flat-square)](#)

HostelHub is an institutional full-stack web application designed to digitize hostel operations, replace cumbersome paper workflows, streamline student-warden communication, and provide unified oversight across hostel buildings, rooms, beds, roll-call attendance, outpass leaves, maintenance complaints, mess dining, fee collections, security visitor passes, and administrative reports.

---

## 🌟 Key System Features

### 🎓 Student Portal
1. **Personalized Dashboard:** Welcome banner with room/bed allocation badge, quick action grid, real-time attendance percentage, pending leaves counter, open complaints, and fee dues.
2. **Room & Amenities:** Inspect assigned hostel, block, floor, room type, facilities, roommate list, and overall campus room availability.
3. **Attendance Tracking:** Personal biometric roll-call history, monthly attendance filter, and percentage formula calculation with zero-day division protection.
4. **Digital Leave Requests:** Submit outpass/leave requests (Home, Medical, Personal, Other) with destination and parent contact; monitor approval status and warden remarks.
5. **Maintenance & Complaints:** File maintenance tickets (Electrical, Plumbing, Wi-Fi, Food, Room, Security) with priority flags and track technician assignment and resolution notes.
6. **Dining & Mess Feedback:** 7-day dining schedule (Breakfast, Lunch, Evening Snacks, Dinner) with an anonymous food feedback rating system (Quality, Taste, Cleanliness, Comments).
7. **Fee Invoicing & Sandbox Payments:** View semester hostel fees, outstanding balances, and execute prototype simulated payments with instant receipts.
8. **Security Gate Visitor Passes:** Pre-register expected visitors (name, relationship, phone, time window) and track security check-in and check-out logs.
9. **Emergency Directory:** Quick-dial telephone links (`tel:`) for Chief Warden, Security Control Room, Ambulance, Police, and Fire Services.
10. **In-App Notification Center:** Real-time unread counter, badge categorization, and direct links.

### 🛡️ Warden & Administrator Console
1. **Executive Dashboard:** Live KPI statistics cards, Recharts visualizations for room bed occupancy distribution, complaint categories, and fee collection vs. outstanding balances.
2. **Student Directory:** Search by student name, roll number, department; filter by allocation status.
3. **Hostel & Room Hierarchy:** Manage Hostels, Blocks, Floors, Rooms, and automated individual Bed registries (A, B, C...).
4. **Bed Allocation & Transfer:** Allocate unallocated students to vacant beds transactionally, transfer residents between rooms, or vacate beds upon checkout.
5. **Daily Roll-Call Attendance:** Night attendance sheet, student search, individual Present/Absent toggle, and one-click **"Mark All Present"** bulk verification.
6. **Leave Review:** Review pending student outpasses, approve or reject with custom administrative remarks, and trigger instant student notifications.
7. **Ticket Resolution:** Manage maintenance requests, assign technicians, update progress status, and log resolution notes.
8. **Announcement Broadcaster:** Publish circulars with category filters; broadcast high-priority **Emergency Alerts** to all resident notifications.
9. **Mess Menu Builder:** Update weekly breakfast, lunch, snacks, and dinner schedules; review aggregated anonymous student meal ratings.
10. **Fee Billing:** Generate student fee invoices with due dates; view simulated transaction logs.
11. **Security Gate Clearance:** Approve or reject visitor passes; record actual check-in and check-out timestamps.
12. **Institutional Reports & CSV Export:** Live preview and direct CSV export for 7 core reports:
    - Student Roster Report
    - Room Bed Occupancy Report
    - Roll-Call Attendance Report
    - Leave Outpass Report
    - Maintenance Complaints Report
    - Fee Assessment & Collections Report
    - Security Visitor Passes Report
13. **Audit Trail & System Governance:** Full immutable audit log capturing administrative actions, timestamps, and target entities.

---

## 🛠️ Technology Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend** | Next.js 14 (App Router), React 18, TypeScript, Tailwind CSS, Lucide React, Recharts |
| **Backend** | Next.js Route Handlers, Node.js, RESTful Architecture, Zod Validation |
| **Database** | MongoDB via Mongoose 9 ODM (Schemas, References, Compound Indexes, Timestamps) |
| **Embedded DB** | `mongodb-memory-server` automatic fallback for zero-configuration testing & local demo runs |
| **Authentication** | Server-side JOSE (JWT), HTTP-only SameSite cookies, bcryptjs password hashing |
| **Auditing & RBAC** | Server-enforced Role-Based Access Control (`student`, `admin`, `warden`) & AuditLog service |

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js**: v18.0.0 or later (Tested on Node v20 & v26)
- **npm**: v9.0.0 or later

### 2. Installation
Clone the repository and install dependencies:
```bash
git clone <repository-url>
cd hostelhub
npm install
```

### 3. Environment Configuration
Create a `.env.local` file or copy `.env.example`:
```bash
cp .env.example .env.local
```

Default contents of `.env.local`:
```env
# MongoDB Connection String (leave as default or memory to use embedded in-memory database)
MONGODB_URI=mongodb://127.0.0.1:27017/hostelhub

# Authentication Secret (at least 32 characters)
AUTH_SECRET=hostelhub-production-secure-secret-key-32chars

# Application URL
APP_URL=http://localhost:3000
NODE_ENV=development
```

> **Zero-Config Notice:** If you do not have an active external MongoDB daemon running locally, HostelHub will **automatically launch an embedded in-memory MongoDB instance** (`mongodb-memory-server`) seamlessly without any manual database setup required!

### 4. Database Seeding
Populate the database with rich, realistic institutional demo data:
```bash
npm run seed
```

### 5. Running the Application
Start the development server:
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) in your web browser.

### 6. Production Build
Verify the production build:
```bash
npm run build
npm start
```

---

## 🔑 Demo Credentials for Testing & Review

| Role | Email / Student ID | Password | Notes |
| :--- | :--- | :--- | :--- |
| **Chief Warden / Admin** | `admin@hostelhub.edu` | `Admin@123` | Full administrative & review access |
| **Allocated Student** | `student1@hostelhub.edu` (or `STU-2026-001`) | `Student@123` | Aarav Mehta (Room 101, Bed A; active fees & leaves) |
| **Roommate Student** | `student3@hostelhub.edu` (or `STU-2026-003`) | `Student@123` | Rohan Varma (Room 101, Bed B; roommate with Aarav) |
| **Unallocated Student** | `student4@hostelhub.edu` (or `STU-2026-004`) | `Student@123` | Ananya Iyer (Test room allocation workflow in Admin) |

> 💡 **Quick Login:** The login screen provides **"One-Click Demo Accounts"** buttons to instantly fill and sign into the Student or Warden consoles.

---

## 🧪 Automated Integration Tests

HostelHub includes an end-to-end automated test runner verifying 10 critical workflows:
1. User registration & unique Student ID / email constraints
2. Password hashing & credential verification
3. JWT signing & role payload verification
4. Room and Bed allocation & concurrency / duplicate active allocation prevention
5. Attendance formula calculation & zero-day edge case handling
6. Leave request review and remark persistence
7. Complaint lifecycle from `Submitted` to `Resolved`
8. Fee balance calculation & simulated payment ledger updates
9. Visitor request check-in and check-out logs
10. In-App notification generation and unread counter state

Run the test suite:
```bash
npm test
```

---

## 📡 REST API Route Structure

| Endpoint | Methods | Description |
| :--- | :--- | :--- |
| `/api/auth/register` | `POST` | Public student registration with field validations |
| `/api/auth/login` | `POST` | Role-aware login with HTTP-only session cookies |
| `/api/auth/logout` | `POST` | Clears authentication session cookie |
| `/api/auth/me` | `GET` | Returns authenticated user and populated profile |
| `/api/auth/forgot-password`| `POST` | Generates single-use expiring reset token |
| `/api/auth/reset-password` | `POST` | Resets password with token verification |
| `/api/auth/change-password`| `POST` | Changes password for authenticated user |
| `/api/students/profile` | `GET`, `PUT` | Student view & permitted contact details edit |
| `/api/students` | `GET` | Admin student search, filter by department & allocation |
| `/api/hostels` | `GET`, `POST` | List and create hostel buildings with blocks & floors |
| `/api/rooms` | `GET`, `POST` | List and create rooms with automated bed generation |
| `/api/allocations` | `GET`, `POST` | List active allocations; assign student to bed |
| `/api/allocations/vacate` | `POST` | Check out resident and vacate bed |
| `/api/allocations/transfer`| `POST`| Transfer resident to a different bed |
| `/api/attendance` | `GET`, `POST` | Personal attendance stats; Admin roll-call record |
| `/api/attendance/bulk` | `POST` | Bulk mark attendance for selected date |
| `/api/leaves` | `GET`, `POST` | Personal leave outpasses; Admin leave list |
| `/api/leaves/[id]/review` | `PUT` | Approve or reject leave request with remarks |
| `/api/complaints` | `GET`, `POST` | Submit and list maintenance tickets |
| `/api/complaints/[id]` | `GET`, `PUT` | Update ticket status, technician, and notes |
| `/api/notices` | `GET`, `POST` | Public announcements; Admin circular broadcaster |
| `/api/notices/[id]` | `PUT`, `DELETE`| Update or remove announcements |
| `/api/mess-menu` | `GET`, `POST` | Weekly 7-day dining schedule builder |
| `/api/food-feedback` | `GET`, `POST` | Submit meal ratings; anonymous admin ratings summary |
| `/api/fees` | `GET`, `POST` | Student fee records; Admin invoice generation |
| `/api/payments/simulate` | `POST` | Sandbox simulated payment execution |
| `/api/visitors` | `GET`, `POST` | Register visitor pass; view pass history |
| `/api/visitors/[id]/review`| `PUT` | Gate check-in and check-out time logger |
| `/api/emergency-contacts` | `GET`, `POST` | Campus hotlines with clickable `tel:` links |
| `/api/notifications` | `GET`, `PUT` | Unread notifications list & mark as read |
| `/api/admin/dashboard` | `GET` | Aggregated analytics, Recharts datasets & queues |
| `/api/reports` | `GET` | JSON preview & direct CSV export for all 7 modules |
| `/api/admin/audit-logs` | `GET` | Administrative audit trail logs |

---

## 🏛️ Database Schemas Architecture

- **`User`**: Account identity, hashed passwords, roles (`student`, `admin`, `warden`), phone, active state.
- **`StudentProfile`**: Academic metadata, department, year, gender, guardian contact, residential links.
- **`Hostel`**: Hostel building, campus code, warden contact, capacity, gender classification.
- **`Block` & `Floor`**: Intermediate architectural hierarchy dividing buildings.
- **`Room`**: Room number, type (Single, Double, Triple, Quad), total beds, occupancy counters, facilities.
- **`Bed`**: Bed labels (A, B...), room link, occupancy flag, resident reference.
- **`RoomAllocation`**: Historical records of allocations, transfers, and checkouts.
- **`Attendance`**: Unique `(studentId, date)` pair, status (`Present`, `Absent`), verification details.
- **`LeaveRequest`**: Dates, category, destination, parent phone, reason, review status, remarks.
- **`Complaint`**: Issue category, priority (`Low`, `Medium`, `High`, `Urgent`), technician dispatch, resolution notes.
- **`Notice`**: Circulars, category, priority (`Normal`, `Important`, `Emergency`), broadcast state.
- **`MessMenu`**: Weekly schedule Monday through Sunday for Breakfast, Lunch, Snacks, and Dinner.
- **`FoodFeedback`**: Anonymous 1–5 ratings on quality, taste, cleanliness, and student comments.
- **`FeeRecord`**: Invoices, total amount, paid amount, outstanding dues, due date, status.
- **`PaymentRecord`**: Payment transactions with unique reference codes, timestamps, and ledger notes.
- **`VisitorRequest`**: Expected and actual gate check-in/check-out timestamps, purpose, relation.
- **`EmergencyContact`**: 24/7 campus hotline directory entries with `tel:` links.
- **`Notification`**: Real-time in-app alerts with read/unread flags and target routes.
- **`AuditLog`**: System compliance log recording actor, resource, action, and changes.

---

## 📄 License
This project is open-source and available under the [MIT License](LICENSE).
