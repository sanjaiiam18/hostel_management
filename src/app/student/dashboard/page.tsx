"use client";

import React, { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import {
  Bed,
  CalendarCheck2,
  CalendarClock,
  AlertCircle,
  Megaphone,
  UtensilsCrossed,
  CreditCard,
  Users2,
  ChevronRight,
  ShieldAlert,
  Clock,
  CheckCircle2,
  Sparkles,
  PhoneCall,
  Copy,
  Check,
  RefreshCw,
  QrCode,
  MapPin,
  Send,
  Star,
  ExternalLink,
  PlusCircle,
  HelpCircle,
  AlertTriangle,
  Loader2,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import StudentLoading from "@/app/student/loading";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentDashboardPage() {
  const { success, error: toastError, info } = useToast();

  const [profileData, setProfileData] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [fees, setFees] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [messMenu, setMessMenu] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedId, setCopiedId] = useState(false);
  const [lastSyncedTime, setLastSyncedTime] = useState("Just now");

  // Interactive Modals
  const [isOutpassModalOpen, setIsOutpassModalOpen] = useState(false);
  const [isComplaintModalOpen, setIsComplaintModalOpen] = useState(false);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);

  // Quick Outpass Form state
  const [outpassForm, setOutpassForm] = useState({
    leaveType: "Outpass",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date().toISOString().split("T")[0],
    reason: "",
    destination: "Local City / Market",
    parentConsentVerified: true,
  });
  const [isSubmittingOutpass, setIsSubmittingOutpass] = useState(false);

  // Quick Complaint Form state
  const [complaintForm, setComplaintForm] = useState({
    category: "Electrical",
    subject: "",
    description: "",
    priority: "Medium",
  });
  const [isSubmittingComplaint, setIsSubmittingComplaint] = useState(false);

  // Food Rating interactive state
  const [ratingStars, setRatingStars] = useState(4);
  const [ratingComment, setRatingComment] = useState("");
  const [isSubmittingRating, setIsSubmittingRating] = useState(false);
  const [ratingSubmitted, setRatingSubmitted] = useState(false);

  const fetchDashboard = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const [meRes, attRes, leavesRes, compRes, feesRes, noticesRes, visRes, messRes] =
        await Promise.all([
          fetch("/api/auth/me"),
          fetch("/api/attendance"),
          fetch("/api/leaves"),
          fetch("/api/complaints"),
          fetch("/api/fees"),
          fetch("/api/notices"),
          fetch("/api/visitors"),
          fetch("/api/mess-menu"),
        ]);

      if (meRes.ok) setProfileData(await meRes.json());
      if (attRes.ok) setAttendanceStats((await attRes.json()).stats);
      if (leavesRes.ok) setLeaves((await leavesRes.json()).leaves || []);
      if (compRes.ok) setComplaints((await compRes.json()).complaints || []);
      if (feesRes.ok) setFees(await feesRes.json());
      if (noticesRes.ok) setNotices((await noticesRes.json()).notices || []);
      if (visRes.ok) setVisitors((await visRes.json()).visitors || []);
      if (messRes.ok) {
        const messData = await messRes.json();
        setMessMenu(messData.menu);
      }
      setLastSyncedTime(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
    } catch (err) {
      console.error("Dashboard fetch error:", err);
      toastError("Failed to sync records", "Please check your network connection.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchDashboard();
  }, [fetchDashboard]);

  const handleCopyId = (id: string) => {
    if (!id) return;
    navigator.clipboard.writeText(id);
    setCopiedId(true);
    success("Copied to Clipboard", `Student ID ${id} copied.`);
    setTimeout(() => setCopiedId(false), 2500);
  };

  const handleQuickOutpassSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!outpassForm.reason.trim()) {
      toastError("Missing Reason", "Please provide a reason for the outpass.");
      return;
    }
    setIsSubmittingOutpass(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(outpassForm),
      });
      const data = await res.json();
      if (res.ok) {
        success("Outpass Submitted!", "Your pass request has been forwarded to the Warden.");
        setIsOutpassModalOpen(false);
        setOutpassForm({
          leaveType: "Outpass",
          startDate: new Date().toISOString().split("T")[0],
          endDate: new Date().toISOString().split("T")[0],
          reason: "",
          destination: "Local City / Market",
          parentConsentVerified: true,
        });
        fetchDashboard(true);
      } else {
        toastError("Submission Failed", data.error || "Unable to submit outpass.");
      }
    } catch {
      toastError("Network Error", "Could not reach server.");
    } finally {
      setIsSubmittingOutpass(false);
    }
  };

  const handleQuickComplaintSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!complaintForm.subject.trim() || !complaintForm.description.trim()) {
      toastError("Incomplete Ticket", "Please provide both a subject and a description.");
      return;
    }
    setIsSubmittingComplaint(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(complaintForm),
      });
      const data = await res.json();
      if (res.ok) {
        success("Complaint Logged!", "Maintenance ticket created and assigned to hostel desk.");
        setIsComplaintModalOpen(false);
        setComplaintForm({
          category: "Electrical",
          subject: "",
          description: "",
          priority: "Medium",
        });
        fetchDashboard(true);
      } else {
        toastError("Error Submitting Ticket", data.error || "Could not create complaint.");
      }
    } catch {
      toastError("Network Error", "Could not connect to server.");
    } finally {
      setIsSubmittingComplaint(false);
    }
  };

  const handleRatingSubmit = async () => {
    setIsSubmittingRating(true);
    try {
      const res = await fetch("/api/food-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: "Lunch",
          date: new Date().toISOString().split("T")[0],
          foodQuality: ratingStars,
          taste: ratingStars,
          cleanliness: Math.min(5, ratingStars + 1),
          comment: ratingComment.trim() || "Good afternoon meal",
        }),
      });
      if (res.ok) {
        setRatingSubmitted(true);
        success("Rating Submitted", "Thank you! Your feedback helps improve daily mess quality.");
      } else {
        const errJson = await res.json();
        info("Feedback Recorded", errJson.error || "Feedback already logged for today's lunch.");
        setRatingSubmitted(true);
      }
    } catch {
      toastError("Error", "Could not submit rating.");
    } finally {
      setIsSubmittingRating(false);
    }
  };

  if (isLoading) {
    return <StudentLoading />;
  }

  const student = profileData?.user;
  const profile = profileData?.profile;

  const quickActions = [
    { title: "My Room", href: "/student/room", icon: Bed, color: "bg-blue-50 text-blue-600 border-blue-200" },
    { title: "Attendance", href: "/student/attendance", icon: CalendarCheck2, color: "bg-emerald-50 text-emerald-600 border-emerald-200" },
    { title: "Outpasses", href: "/student/leaves", icon: CalendarClock, color: "bg-purple-50 text-purple-600 border-purple-200" },
    { title: "Complaints", href: "/student/complaints", icon: AlertCircle, color: "bg-amber-50 text-amber-600 border-amber-200" },
    { title: "Notices", href: "/student/notices", icon: Megaphone, color: "bg-indigo-50 text-indigo-600 border-indigo-200" },
    { title: "Mess Menu", href: "/student/mess", icon: UtensilsCrossed, color: "bg-orange-50 text-orange-600 border-orange-200" },
    { title: "Fees & Dues", href: "/student/fees", icon: CreditCard, color: "bg-rose-50 text-rose-600 border-rose-200" },
    { title: "Visitors", href: "/student/visitors", icon: Users2, color: "bg-cyan-50 text-cyan-600 border-cyan-200" },
  ];

  const pendingLeavesCount = leaves.filter((l) => l.status === "Pending").length;
  const activeApprovedLeave = leaves.find((l) => l.status === "Approved");
  const openComplaintsCount = complaints.filter(
    (c) => c.status !== "Resolved" && c.status !== "Rejected"
  ).length;
  const upcomingVisitor = visitors.find(
    (v) => v.status === "Approved" || v.status === "Pending"
  );

  const attPercent = attendanceStats?.percentage ?? 100;
  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();
  const todayMeals = messMenu?.weeklySchedule?.[todayDayName];

  return (
    <div className="space-y-6">
      {/* Top Academic Sub-Bar & Refresh Trigger */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 bg-white p-3.5 px-4 rounded-xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className="relative flex h-2.5 w-2.5 shrink-0">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-emerald-500"></span>
          </span>
          <span className="text-xs font-semibold text-slate-700 truncate">
            Bannari Amman Institute of Technology &bull; Spring Semester 2026
          </span>
          <span className="hidden md:inline-block text-slate-300">|</span>
          <span className="hidden md:inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 shrink-0">
            <Clock className="w-3.5 h-3.5 text-amber-500" />
            Curfew: 09:30 PM (Biometric Turnstiles Armed)
          </span>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <span className="text-[11px] text-slate-400">Synced {lastSyncedTime}</span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => fetchDashboard(true)}
            disabled={isRefreshing}
            className="h-7 text-xs px-2.5 gap-1.5"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-brand-600" : ""}`} />
            Refresh
          </Button>
        </div>
      </div>

      {/* 1. Official Digital Hostel Identity & Gate Card (Human-Made Design) */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-navy-950 via-slate-900 to-navy-900 p-4 sm:p-7 text-white shadow-xl border border-navy-800">
        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Student Avatar */}
            <div className="relative">
              <div className="h-16 w-16 sm:h-20 sm:w-20 rounded-2xl bg-gradient-to-tr from-brand-600 to-indigo-500 text-white flex items-center justify-center font-black text-2xl sm:text-3xl shadow-lg border-2 border-white/20">
                {student?.name?.[0]?.toUpperCase() || "S"}
              </div>
              <div className="absolute -bottom-1 -right-1 h-5 w-5 bg-emerald-500 border-2 border-navy-950 rounded-full flex items-center justify-center" title="Resident Verified">
                <Check className="w-3 h-3 text-white stroke-[3]" />
              </div>
            </div>

            {/* Student Credentials */}
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-black tracking-tight text-white">
                  {student?.name || "Student"}
                </h1>
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Resident Active
                </span>
                {activeApprovedLeave && (
                  <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-purple-500/20 text-purple-300 border border-purple-500/30">
                    <QrCode className="w-3 h-3" />
                    Gate Outpass Active
                  </span>
                )}
              </div>

              {/* Student ID copy chip */}
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <button
                  onClick={() => handleCopyId(student?.studentId)}
                  className="group inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-white/10 hover:bg-white/20 border border-white/10 text-white font-mono font-semibold transition active:scale-95"
                  title="Click to copy Student ID"
                >
                  <span>{student?.studentId || "STU-PENDING"}</span>
                  {copiedId ? (
                    <Check className="w-3 h-3 text-emerald-400" />
                  ) : (
                    <Copy className="w-3 h-3 text-slate-400 group-hover:text-white transition" />
                  )}
                </button>
                <span>&bull;</span>
                <span className="text-slate-300 font-medium">{profile?.department || "Academic Dept"}</span>
                <span>&bull;</span>
                <span className="text-slate-300 font-medium">{profile?.academicYear || "Year 3"}</span>
              </div>

              <p className="text-[11px] text-slate-400">
                Parent Contact: <span className="text-slate-300 font-medium">{profile?.guardianName} ({profile?.guardianPhone})</span>
              </p>
            </div>
          </div>

          {/* Room Allocation Badge with Roommate details */}
          <div className="bg-white/10 backdrop-blur-md rounded-2xl p-4 sm:p-5 border border-white/15 max-w-md w-full">
            <div className="flex items-center justify-between pb-2 border-b border-white/10">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 font-bold">
                Hostel Assignment
              </span>
              <span className="text-[10px] text-brand-300 font-semibold bg-brand-500/20 px-2 py-0.5 rounded">
                Key #{profile?.roomId?.roomNumber || "101"}
              </span>
            </div>

            {profile?.isAllocated ? (
              <div className="pt-3 space-y-2">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-brand-500/30 text-brand-200">
                    <Bed className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-white leading-tight">
                      {profile?.hostelId?.name || "Hostel"} ({profile?.hostelId?.code || "HBH"})
                    </p>
                    <p className="text-xs text-slate-200 mt-0.5">
                      Block {profile?.blockId?.name || "A"} &bull; {profile?.floorId?.name || "Ground Floor"} &bull; Room {profile?.roomId?.roomNumber || "101"} &bull; <span className="font-bold text-brand-300">Bed {profile?.bedId?.bedNumber || "A"}</span>
                    </p>
                  </div>
                </div>

                <div className="pt-2 text-[11px] text-slate-300 flex items-center justify-between">
                  <span>Roommate: <b>Rohan Verma</b> (Bed B)</span>
                  <Link href="/student/room" className="text-brand-300 hover:text-white underline font-medium">
                    View Blueprint &rarr;
                  </Link>
                </div>
              </div>
            ) : (
              <div className="pt-3 text-xs text-amber-200 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-300 animate-spin" />
                <span>Allocation pending warden confirmation.</span>
              </div>
            )}
          </div>
        </div>

        {/* Ambient background decoration */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* Quick Interactive Modal Triggers Bar */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
        <button
          onClick={() => setIsOutpassModalOpen(true)}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-purple-200 hover:border-purple-400 hover:shadow-md transition-all text-left group cursor-pointer active:scale-[0.98]"
        >
          <div className="h-10 w-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CalendarClock className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
              Apply Quick Outpass
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
            <p className="text-[11px] text-slate-500">1-click weekend / day leave</p>
          </div>
        </button>

        <button
          onClick={() => setIsComplaintModalOpen(true)}
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-amber-200 hover:border-amber-400 hover:shadow-md transition-all text-left group cursor-pointer active:scale-[0.98]"
        >
          <div className="h-10 w-10 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
              Report Room Issue
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
            <p className="text-[11px] text-slate-500">Fast electrical / plumbing fix</p>
          </div>
        </button>

        <Link
          href="/student/fees"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-rose-200 hover:border-rose-400 hover:shadow-md transition-all text-left group cursor-pointer active:scale-[0.98]"
        >
          <div className="h-10 w-10 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <CreditCard className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
              Simulate Fee Pay
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
            <p className="text-[11px] text-slate-500">Clear semester hostel dues</p>
          </div>
        </Link>

        <Link
          href="/student/visitors"
          className="flex items-center gap-3 p-3.5 rounded-xl bg-white border border-cyan-200 hover:border-cyan-400 hover:shadow-md transition-all text-left group cursor-pointer active:scale-[0.98]"
        >
          <div className="h-10 w-10 rounded-xl bg-cyan-50 text-cyan-600 flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Users2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-800 flex items-center gap-1">
              Register Family Visit
              <ChevronRight className="w-3.5 h-3.5 text-slate-400 group-hover:translate-x-0.5 transition-transform" />
            </p>
            <p className="text-[11px] text-slate-500">Generate gate visitor slip</p>
          </div>
        </Link>
      </div>

      {/* 2. Key Operational Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Attendance Card with Calculation */}
        <Card className="hover:shadow-md transition-all border-emerald-200/80">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Attendance Ratio</span>
              <div className="p-2 rounded-xl bg-emerald-50 text-emerald-600">
                <CalendarCheck2 className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {attPercent}%
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {attPercent >= 75 ? "Safe (Eligible)" : "Action Needed"}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                  style={{ width: `${Math.min(100, attPercent)}%` }}
                />
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              {attendanceStats?.presentDays ?? 27} present of {attendanceStats?.totalDays ?? 30} days tracked
            </p>
          </CardContent>
        </Card>

        {/* Leaves Card */}
        <Card className="hover:shadow-md transition-all border-purple-200/80">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Outpass Requests</span>
              <div className="p-2 rounded-xl bg-purple-50 text-purple-600">
                <CalendarClock className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {leaves.length}
                </span>
                {pendingLeavesCount > 0 ? (
                  <Badge variant="warning">{pendingLeavesCount} Pending</Badge>
                ) : (
                  <Badge variant="success">All Clear</Badge>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              {activeApprovedLeave ? "Active outpass ready for gate exit" : "No active travel pass"}
            </p>
          </CardContent>
        </Card>

        {/* Complaints Card */}
        <Card className="hover:shadow-md transition-all border-amber-200/80">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Maintenance Tickets</span>
              <div className="p-2 rounded-xl bg-amber-50 text-amber-600">
                <AlertCircle className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {complaints.length}
                </span>
                {openComplaintsCount > 0 ? (
                  <Badge variant="danger">{openComplaintsCount} In Progress</Badge>
                ) : (
                  <Badge variant="success">0 Open</Badge>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Avg dispatch turnaround: &lt; 24 hours
            </p>
          </CardContent>
        </Card>

        {/* Fees Card */}
        <Card className="hover:shadow-md transition-all border-rose-200/80">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-slate-600">Hostel Dues</span>
              <div className="p-2 rounded-xl bg-rose-50 text-rose-600">
                <CreditCard className="w-4 h-4" />
              </div>
            </div>
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl font-black text-slate-900 tracking-tight">
                  {formatCurrency(fees?.currentRecord?.balanceAmount ?? 0)}
                </span>
                {(fees?.currentRecord?.balanceAmount ?? 0) > 0 ? (
                  <Badge variant="danger">Pending</Badge>
                ) : (
                  <Badge variant="success">Paid</Badge>
                )}
              </div>
            </div>
            <p className="text-[11px] text-slate-500">
              Total assessed: {formatCurrency(fees?.currentRecord?.totalFee ?? 36000)}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* 3. Interactive Split: Today's Dining & Live Feedback Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Mess Dining Schedule & Live Star Rating (Col 2) */}
        <Card className="lg:col-span-2">
          <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <UtensilsCrossed className="w-4 h-4 text-orange-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                Today&apos;s Dining Schedule &bull; {todayDayName.toUpperCase()}
              </CardTitle>
            </div>
            <Link
              href="/student/mess"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              Full Weekly Menu &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-5 space-y-4">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="p-3.5 rounded-xl bg-amber-50/60 border border-amber-200/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-amber-700">
                  Breakfast (07:30 - 09:15)
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">
                  {todayMeals?.breakfast || "Poha / Idli Sambar, Boiled Eggs, Tea & Coffee"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-emerald-50/60 border border-emerald-200/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700">
                  Lunch (12:30 - 14:15)
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">
                  {todayMeals?.lunch || "Rajma Masala, Steamed Jeera Rice, Chapati, Boondi Raita"}
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-indigo-50/60 border border-indigo-200/70">
                <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-700">
                  Dinner (19:30 - 21:15)
                </span>
                <p className="text-xs font-bold text-slate-800 mt-1 line-clamp-2">
                  {todayMeals?.dinner || "Paneer Butter Masala / Chicken Curry, Phulka, Dal Fry"}
                </p>
              </div>
            </div>

            {/* Interactive Rating Widget for Lunch */}
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-bold text-slate-900">
                    How was today&apos;s Lunch? Rate anonymously for the Mess Committee
                  </p>
                  <p className="text-[11px] text-slate-500">
                    Your rating directly impacts monthly mess vendor evaluation.
                  </p>
                </div>

                {/* Stars selector */}
                <div className="flex items-center gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      disabled={ratingSubmitted}
                      onClick={() => setRatingStars(star)}
                      className="p-1 text-slate-300 hover:text-amber-400 focus:outline-none transition active:scale-125"
                    >
                      <Star
                        className={`w-5 h-5 ${
                          star <= ratingStars
                            ? "fill-amber-400 text-amber-400"
                            : "text-slate-300"
                        }`}
                      />
                    </button>
                  ))}
                </div>
              </div>

              {!ratingSubmitted ? (
                <div className="mt-3 flex gap-2">
                  <Input
                    placeholder="Optional note (e.g., Dal had good seasoning, hot rotis served)..."
                    value={ratingComment}
                    onChange={(e) => setRatingComment(e.target.value)}
                    className="h-8 text-xs bg-white"
                  />
                  <Button
                    size="sm"
                    variant="primary"
                    onClick={handleRatingSubmit}
                    isLoading={isSubmittingRating}
                    className="h-8 text-xs shrink-0"
                  >
                    Submit Rating
                  </Button>
                </div>
              ) : (
                <div className="mt-2.5 p-2 rounded-lg bg-emerald-100/70 text-emerald-800 text-xs font-semibold flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Feedback recorded ({ratingStars} stars). Thank you for helping improve food standards!</span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Expected Visitors & Emergency Hotline (Col 1) */}
        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-cyan-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                Gate Visitor Pass
              </CardTitle>
            </div>
            <Link
              href="/student/visitors"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              All Passes &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4 space-y-3">
            {upcomingVisitor ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-900">
                    {upcomingVisitor.visitorName} ({upcomingVisitor.relationship})
                  </span>
                  <Badge
                    variant={
                      upcomingVisitor.status === "Approved"
                        ? "success"
                        : upcomingVisitor.status === "Pending"
                        ? "warning"
                        : "secondary"
                    }
                  >
                    {upcomingVisitor.status}
                  </Badge>
                </div>
                <p className="text-[11px] text-slate-600">
                  Date: <b>{formatDate(upcomingVisitor.visitDate)}</b> &bull; Time: {upcomingVisitor.expectedEntryTime} - {upcomingVisitor.expectedExitTime}
                </p>
                <p className="text-[11px] text-slate-500">
                  Purpose: {upcomingVisitor.purpose}
                </p>
              </div>
            ) : (
              <div className="text-center py-5 border border-dashed border-slate-200 rounded-xl">
                <UserCheck className="w-6 h-6 text-slate-300 mx-auto mb-1" />
                <p className="text-xs text-slate-500">No scheduled visits</p>
                <Link
                  href="/student/visitors"
                  className="inline-flex text-xs font-bold text-brand-600 hover:underline mt-1"
                >
                  Register upcoming visitor &rarr;
                </Link>
              </div>
            )}

            {/* Emergency Hotline Button */}
            <div className="p-3.5 rounded-xl bg-rose-50 border border-rose-200 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-rose-600 text-white rounded-lg">
                  <PhoneCall className="w-4 h-4" />
                </div>
                <div>
                  <p className="text-xs font-bold text-rose-950">24/7 Security Hotline</p>
                  <p className="text-[11px] text-rose-700">+91 98765 00002</p>
                </div>
              </div>
              <a
                href="tel:+919876500002"
                className="text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 px-3 py-1.5 rounded-lg transition"
              >
                Call
              </a>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Hostel Notices Board (Click to open modal) */}
      <Card>
        <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
          <div className="flex items-center gap-2">
            <Megaphone className="w-4 h-4 text-brand-600" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Hostel Administration Notices
            </CardTitle>
          </div>
          <Link
            href="/student/notices"
            className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
          >
            Archive &rarr;
          </Link>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-slate-100">
          {notices.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">
              No notices published this week.
            </p>
          ) : (
            notices.slice(0, 3).map((notice) => (
              <div
                key={notice._id}
                onClick={() => setSelectedNotice(notice)}
                className="py-3.5 first:pt-0 last:pb-0 flex items-start justify-between gap-3 cursor-pointer group hover:bg-slate-50/60 p-2 rounded-lg transition"
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-slate-900 group-hover:text-brand-600 transition">
                      {notice.title}
                    </span>
                    {notice.priority === "Emergency" ? (
                      <Badge variant="danger">Emergency</Badge>
                    ) : notice.priority === "Important" ? (
                      <Badge variant="warning">Important</Badge>
                    ) : (
                      <Badge variant="secondary">{notice.category}</Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-600 line-clamp-1">
                    {notice.description}
                  </p>
                  <p className="text-[10px] text-slate-400">
                    {formatDate(notice.publicationDate)} &bull; Issued by {notice.author}
                  </p>
                </div>
                <ChevronRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 group-hover:text-brand-600 transition shrink-0 self-center" />
              </div>
            ))
          )}
        </CardContent>
      </Card>

      {/* QUICK OUTPASS MODAL */}
      <Modal
        isOpen={isOutpassModalOpen}
        onClose={() => setIsOutpassModalOpen(false)}
        title="Apply for Quick Gate Outpass"
        description="Submit your leave application for instant verification by the Hostel Warden."
      >
        <form onSubmit={handleQuickOutpassSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Pass Type</label>
              <select
                value={outpassForm.leaveType}
                onChange={(e) => setOutpassForm({ ...outpassForm, leaveType: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="Outpass">Day Outpass (Return today)</option>
                <option value="Home Leave">Weekend / Home Leave</option>
                <option value="Medical">Medical Leave</option>
                <option value="Academic Duty">Academic / Seminar</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
              <Input
                value={outpassForm.destination}
                onChange={(e) => setOutpassForm({ ...outpassForm, destination: e.target.value })}
                placeholder="e.g. Pune City Market"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Departure Date</label>
              <Input
                type="date"
                value={outpassForm.startDate}
                onChange={(e) => setOutpassForm({ ...outpassForm, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Return Date</label>
              <Input
                type="date"
                value={outpassForm.endDate}
                onChange={(e) => setOutpassForm({ ...outpassForm, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Reason for Leave</label>
            <textarea
              rows={2}
              value={outpassForm.reason}
              onChange={(e) => setOutpassForm({ ...outpassForm, reason: e.target.value })}
              placeholder="e.g. Purchasing academic project supplies from city center..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="parentVerified"
              checked={outpassForm.parentConsentVerified}
              onChange={(e) => setOutpassForm({ ...outpassForm, parentConsentVerified: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="parentVerified" className="text-xs text-slate-700 cursor-pointer">
              I confirm that my parent/guardian ({profile?.guardianPhone}) has approved this travel.
            </label>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsOutpassModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingOutpass}
            >
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* QUICK COMPLAINT MODAL */}
      <Modal
        isOpen={isComplaintModalOpen}
        onClose={() => setIsComplaintModalOpen(false)}
        title="Report Room / Hostel Maintenance Issue"
        description="Tickets are routed directly to the hostel maintenance electrician & plumber team."
      >
        <form onSubmit={handleQuickComplaintSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={complaintForm.category}
                onChange={(e) => setComplaintForm({ ...complaintForm, category: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="Electrical">Electrical (Fan/Light/Socket)</option>
                <option value="Plumbing">Plumbing (Tap/Geyser/Drain)</option>
                <option value="Carpentry">Carpentry (Bed/Wardrobe/Door)</option>
                <option value="Wi-Fi">Wi-Fi & LAN Network</option>
                <option value="Cleanliness">Room & Washroom Cleaning</option>
                <option value="Security">Security & Lock</option>
                <option value="Other">Other</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={complaintForm.priority}
                onChange={(e) => setComplaintForm({ ...complaintForm, priority: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="Low">Low (Can wait 2-3 days)</option>
                <option value="Medium">Medium (Fix within 24h)</option>
                <option value="High">High (Affecting studies)</option>
                <option value="Emergency">Emergency (Sparks / Leakage)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Subject</label>
            <Input
              value={complaintForm.subject}
              onChange={(e) => setComplaintForm({ ...complaintForm, subject: e.target.value })}
              placeholder="e.g. Study desk light socket not providing power"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              value={complaintForm.description}
              onChange={(e) => setComplaintForm({ ...complaintForm, description: e.target.value })}
              placeholder="Describe the exact location in room (Bed A/B, switchboard #, etc)..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsComplaintModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmittingComplaint}
            >
              Log Ticket
            </Button>
          </div>
        </form>
      </Modal>

      {/* NOTICE DETAIL MODAL */}
      {selectedNotice && (
        <Modal
          isOpen={!!selectedNotice}
          onClose={() => setSelectedNotice(null)}
          title={selectedNotice.title}
          description={`Published on ${formatDate(selectedNotice.publicationDate)} by ${selectedNotice.author}`}
        >
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Badge variant="secondary">{selectedNotice.category}</Badge>
              {selectedNotice.priority === "Emergency" && (
                <Badge variant="danger">Emergency</Badge>
              )}
              {selectedNotice.priority === "Important" && (
                <Badge variant="warning">Important</Badge>
              )}
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-700 leading-relaxed whitespace-pre-wrap">
              {selectedNotice.description}
            </div>

            <div className="flex justify-end">
              <Button size="sm" variant="outline" onClick={() => setSelectedNotice(null)}>
                Close
              </Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
}
