"use client";

import React, { useState, useEffect } from "react";
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
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentDashboardPage() {
  const [profileData, setProfileData] = useState<any>(null);
  const [attendanceStats, setAttendanceStats] = useState<any>(null);
  const [leaves, setLeaves] = useState<any[]>([]);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [fees, setFees] = useState<any>(null);
  const [notices, setNotices] = useState<any[]>([]);
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      try {
        const [meRes, attRes, leavesRes, compRes, feesRes, noticesRes, visRes] =
          await Promise.all([
            fetch("/api/auth/me"),
            fetch("/api/attendance"),
            fetch("/api/leaves"),
            fetch("/api/complaints"),
            fetch("/api/fees"),
            fetch("/api/notices"),
            fetch("/api/visitors"),
          ]);

        if (meRes.ok) setProfileData(await meRes.json());
        if (attRes.ok) setAttendanceStats((await attRes.json()).stats);
        if (leavesRes.ok) setLeaves((await leavesRes.json()).leaves || []);
        if (compRes.ok) setComplaints((await compRes.json()).complaints || []);
        if (feesRes.ok) setFees(await feesRes.json());
        if (noticesRes.ok) setNotices((await noticesRes.json()).notices || []);
        if (visRes.ok) setVisitors((await visRes.json()).visitors || []);
      } catch (err) {
        console.error("Dashboard fetch error:", err);
      } finally {
        setIsLoading(false);
      }
    }
    fetchDashboard();
  }, []);

  const student = profileData?.user;
  const profile = profileData?.profile;

  const quickActions = [
    { title: "My Room", href: "/student/room", icon: Bed, color: "bg-blue-50 text-blue-600" },
    { title: "Attendance", href: "/student/attendance", icon: CalendarCheck2, color: "bg-emerald-50 text-emerald-600" },
    { title: "Leave Requests", href: "/student/leaves", icon: CalendarClock, color: "bg-purple-50 text-purple-600" },
    { title: "Complaints", href: "/student/complaints", icon: AlertCircle, color: "bg-amber-50 text-amber-600" },
    { title: "Notices", href: "/student/notices", icon: Megaphone, color: "bg-indigo-50 text-indigo-600" },
    { title: "Mess Menu", href: "/student/mess", icon: UtensilsCrossed, color: "bg-orange-50 text-orange-600" },
    { title: "Fees & Dues", href: "/student/fees", icon: CreditCard, color: "bg-rose-50 text-rose-600" },
    { title: "Visitors", href: "/student/visitors", icon: Users2, color: "bg-cyan-50 text-cyan-600" },
  ];

  const pendingLeavesCount = leaves.filter((l) => l.status === "Pending").length;
  const openComplaintsCount = complaints.filter(
    (c) => c.status !== "Resolved" && c.status !== "Rejected"
  ).length;
  const latestNotice = notices[0];
  const upcomingVisitor = visitors.find(
    (v) => v.status === "Approved" || v.status === "Pending"
  );

  return (
    <div className="space-y-6">
      {/* 1. Welcome Section */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-navy-950 via-navy-900 to-brand-950 p-6 sm:p-8 text-white shadow-xl">
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="h-16 w-16 rounded-2xl bg-brand-500/20 text-brand-300 border-2 border-brand-400/30 flex items-center justify-center font-bold text-2xl shadow-inner">
              {student?.name?.[0]?.toUpperCase() || "S"}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight">
                  Welcome, {student?.name || "Student"}!
                </h1>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active
                </span>
              </div>
              <p className="text-xs text-slate-300 mt-1">
                Student ID: <span className="font-semibold text-white">{student?.studentId}</span> •{" "}
                {profile?.department || "Student Portal"} • {profile?.academicYear || "Enrolled"}
              </p>
            </div>
          </div>

          {/* Allocation badge */}
          <div className="bg-white/10 backdrop-blur-md rounded-xl p-4 border border-white/10 max-w-sm">
            <p className="text-[11px] uppercase tracking-wider text-slate-300 font-semibold mb-1">
              Hostel Allocation
            </p>
            {profile?.isAllocated ? (
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-brand-500/30 text-brand-200">
                  <Bed className="w-5 h-5" />
                </div>
                <div>
                  <p className="text-sm font-bold text-white leading-tight">
                    {profile?.hostelId?.name || "Hostel"}
                  </p>
                  <p className="text-xs text-slate-300">
                    Block {profile?.blockId?.name || "A"} • Room {profile?.roomId?.roomNumber || "N/A"} • Bed {profile?.bedId?.bedNumber || "N/A"}
                  </p>
                </div>
              </div>
            ) : (
              <div className="text-xs text-amber-200 flex items-center gap-2">
                <Clock className="w-4 h-4 shrink-0 text-amber-300" />
                <span>Room allocation pending with hostel warden.</span>
              </div>
            )}
          </div>
        </div>

        {/* Ambient background blur elements */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
      </div>

      {/* 2. Quick Action Cards (Section 6) */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-500">
            Quick Actions
          </h2>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {quickActions.map((action) => {
            const Icon = action.icon;
            return (
              <Link
                key={action.title}
                href={action.href}
                className="group flex flex-col items-center justify-center p-3.5 rounded-xl bg-white border border-slate-200/80 hover:border-brand-400 hover:shadow-md transition-all text-center"
              >
                <div
                  className={`p-2.5 rounded-xl mb-2 transition-transform group-hover:scale-110 ${action.color}`}
                >
                  <Icon className="w-5 h-5" />
                </div>
                <span className="text-xs font-semibold text-slate-800 group-hover:text-brand-600 transition-colors">
                  {action.title}
                </span>
              </Link>
            );
          })}
        </div>
      </div>

      {/* 3. Summary Widgets Grid */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {/* Widget 1: Attendance Percentage */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 border-b-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Attendance
            </CardTitle>
            <Link
              href="/student/attendance"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold flex items-center"
            >
              Details &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-900">
                {attendanceStats?.percentage ?? 100}%
              </span>
              <span className="text-xs text-slate-500">overall</span>
            </div>
            <div className="w-full bg-slate-100 rounded-full h-2 mt-2 overflow-hidden">
              <div
                className={`h-2 rounded-full transition-all duration-500 ${
                  (attendanceStats?.percentage ?? 100) >= 75
                    ? "bg-emerald-500"
                    : "bg-rose-500"
                }`}
                style={{ width: `${Math.min(100, attendanceStats?.percentage ?? 100)}%` }}
              />
            </div>
            <div className="mt-3 flex items-center justify-between text-xs text-slate-500">
              <span>Present: <b className="text-slate-800">{attendanceStats?.presentDays ?? 0}</b> days</span>
              <span>Absent: <b className="text-slate-800">{attendanceStats?.absentDays ?? 0}</b> days</span>
            </div>
          </CardContent>
        </Card>

        {/* Widget 2: Pending Requests & Complaints */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 border-b-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Requests & Issues
            </CardTitle>
            <div className="flex gap-2 text-xs">
              <Link href="/student/leaves" className="text-brand-600 font-semibold">
                Leaves
              </Link>
              <span>•</span>
              <Link href="/student/complaints" className="text-brand-600 font-semibold">
                Complaints
              </Link>
            </div>
          </CardHeader>
          <CardContent className="p-4 pt-1 space-y-3">
            <div className="flex items-center justify-between p-2.5 rounded-lg bg-purple-50/70 border border-purple-100">
              <div className="flex items-center gap-2">
                <CalendarClock className="w-4 h-4 text-purple-600" />
                <span className="text-xs font-medium text-slate-700">Pending Leaves</span>
              </div>
              <Badge variant={pendingLeavesCount > 0 ? "warning" : "secondary"}>
                {pendingLeavesCount} Pending
              </Badge>
            </div>

            <div className="flex items-center justify-between p-2.5 rounded-lg bg-amber-50/70 border border-amber-100">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600" />
                <span className="text-xs font-medium text-slate-700">Open Complaints</span>
              </div>
              <Badge variant={openComplaintsCount > 0 ? "danger" : "secondary"}>
                {openComplaintsCount} Active
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Widget 3: Fee Payment Status */}
        <Card className="hover:shadow-md transition-shadow">
          <CardHeader className="p-4 pb-2 border-b-0 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-semibold text-slate-700">
              Hostel Fees
            </CardTitle>
            <Link
              href="/student/fees"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              Pay Now &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4 pt-1">
            <div className="flex items-baseline justify-between">
              <div>
                <p className="text-[11px] text-slate-500 uppercase tracking-wider font-semibold">
                  Outstanding Balance
                </p>
                <p className="text-2xl font-extrabold text-slate-900 mt-0.5">
                  {formatCurrency(fees?.summary?.totalOutstanding || 0)}
                </p>
              </div>
              <Badge
                variant={
                  (fees?.summary?.totalOutstanding || 0) === 0
                    ? "success"
                    : "warning"
                }
              >
                {(fees?.summary?.totalOutstanding || 0) === 0 ? "Paid in Full" : "Due"}
              </Badge>
            </div>
            <div className="mt-3 text-xs text-slate-500 flex justify-between border-t border-slate-100 pt-2">
              <span>Total Assessed: {formatCurrency(fees?.summary?.totalFees || 0)}</span>
              <span className="text-emerald-600 font-medium">
                Paid: {formatCurrency(fees?.summary?.totalPaid || 0)}
              </span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* 4. Bottom Section: Notices & Visitors */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Latest Notices */}
        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Megaphone className="w-4 h-4 text-brand-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                Hostel Announcements
              </CardTitle>
            </div>
            <Link
              href="/student/notices"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              View all &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-slate-100">
            {notices.length === 0 ? (
              <p className="text-xs text-slate-400 py-4 text-center">
                No announcements at this time.
              </p>
            ) : (
              notices.slice(0, 3).map((notice) => (
                <div key={notice._id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-xs font-bold text-slate-800 line-clamp-1">
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
                  <p className="text-xs text-slate-600 mt-1 line-clamp-2">
                    {notice.description}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-1">
                    {formatDate(notice.publicationDate)} • {notice.author}
                  </p>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Visitors & Emergency Quick Contacts */}
        <Card>
          <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Users2 className="w-4 h-4 text-cyan-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                Expected Visitors
              </CardTitle>
            </div>
            <Link
              href="/student/visitors"
              className="text-xs text-brand-600 hover:text-brand-700 font-semibold"
            >
              Request Pass &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4">
            {upcomingVisitor ? (
              <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-800">
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
                <p className="text-xs text-slate-600 mt-1">
                  Visit Date: <b>{formatDate(upcomingVisitor.visitDate)}</b> ({upcomingVisitor.expectedEntryTime} - {upcomingVisitor.expectedExitTime})
                </p>
                <p className="text-xs text-slate-500 mt-0.5">
                  Purpose: {upcomingVisitor.purpose}
                </p>
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-xs text-slate-400 mb-2">No pending or approved visitors</p>
                <Link
                  href="/student/visitors"
                  className="inline-flex text-xs font-semibold text-brand-600 hover:underline"
                >
                  Register an upcoming visitor &rarr;
                </Link>
              </div>
            )}

            {/* Emergency Hotline Banner */}
            <div className="mt-4 p-3 rounded-xl bg-rose-50 border border-rose-200/80 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <PhoneCall className="w-4 h-4 text-rose-600" />
                <div>
                  <p className="text-xs font-bold text-rose-950">Hostel Emergency Hotline</p>
                  <p className="text-[11px] text-rose-700">24/7 Warden & Security Desk</p>
                </div>
              </div>
              <Link
                href="/student/emergency"
                className="text-xs font-bold text-rose-700 bg-rose-100 hover:bg-rose-200 px-3 py-1.5 rounded-lg transition"
              >
                View Numbers
              </Link>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
