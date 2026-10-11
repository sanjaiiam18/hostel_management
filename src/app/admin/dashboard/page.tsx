"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  Users,
  Building2,
  Bed,
  CalendarClock,
  AlertCircle,
  UserCheck,
  CreditCard,
  CheckCircle2,
  XCircle,
  Clock,
  ArrowRight,
  ShieldAlert,
  Activity,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import StatCard from "@/components/dashboard/StatCard";
import { formatCurrency, formatDate, formatDateTime } from "@/lib/utils";

// Recharts components
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  Legend,
} from "recharts";

export default function AdminDashboardPage() {
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState("");

  const fetchDashboardData = async () => {
    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const handleQuickReviewLeave = async (id: string, status: "Approved" | "Rejected") => {
    try {
      const res = await fetch(`/api/leaves/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks: `Reviewed from dashboard as ${status}` }),
      });
      if (res.ok) {
        setActionMessage(`Leave request #${id.slice(-4)} ${status.toLowerCase()}.`);
        setTimeout(() => setActionMessage(""), 3000);
        fetchDashboardData();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const actionItems = data?.actionItems || {};

  const occupancyPieData = charts.occupancyData || [
    { name: "Occupied Beds", value: stats.occupiedBeds || 0, color: "#4f46e5" },
    { name: "Available Beds", value: stats.availableBeds || 0, color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Administrative Control Center</h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time occupancy metrics, student operations, financial dues, and maintenance queue
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Link href="/admin/rooms">
            <Button size="sm" variant="outline" className="gap-1.5">
              <Building2 className="w-3.5 h-3.5" /> Manage Hostels
            </Button>
          </Link>
          <Link href="/admin/reports">
            <Button size="sm" className="gap-1.5">
              Export Reports &rarr;
            </Button>
          </Link>
        </div>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl animate-in fade-in">
          {actionMessage}
        </div>
      )}

      {/* 1. Core KPIs Statistics Grid (Section 18) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
        <StatCard
          title="Active Students"
          value={stats.totalStudents ?? 0}
          icon={Users}
          description="Registered residents"
          colorClass="bg-blue-50 text-blue-600"
        />
        <StatCard
          title="Total Rooms"
          value={stats.totalRooms ?? 0}
          icon={Building2}
          description="Across all blocks"
          colorClass="bg-purple-50 text-purple-600"
        />
        <StatCard
          title="Available Beds"
          value={stats.availableBeds ?? 0}
          icon={Bed}
          description={`of ${stats.totalBeds ?? 0} total beds`}
          colorClass="bg-emerald-50 text-emerald-600"
        />
        <StatCard
          title="Pending Leaves"
          value={stats.pendingLeaves ?? 0}
          icon={CalendarClock}
          description="Awaiting warden review"
          colorClass="bg-amber-50 text-amber-600"
        />
        <StatCard
          title="Open Complaints"
          value={stats.pendingComplaints ?? 0}
          icon={AlertCircle}
          description="Maintenance backlog"
          colorClass="bg-rose-50 text-rose-600"
        />
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400">
              Pending Visitors
            </p>
            <p className="text-xl font-extrabold text-slate-900 mt-0.5">
              {stats.pendingVisitors ?? 0} passes
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-cyan-50 text-cyan-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400">
              Collected Hostel Fees
            </p>
            <p className="text-xl font-extrabold text-emerald-600 mt-0.5">
              {formatCurrency(stats.totalCollected ?? 0)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-emerald-50 text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between">
          <div>
            <p className="text-[11px] font-semibold uppercase text-slate-400">
              Outstanding Dues
            </p>
            <p className="text-xl font-extrabold text-rose-600 mt-0.5">
              {formatCurrency(stats.totalOutstanding ?? 0)}
            </p>
          </div>
          <div className="p-2.5 rounded-xl bg-rose-50 text-rose-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 2. Analytical Charts (Recharts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Occupancy Distribution */}
        <Card>
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">
              Room Bed Occupancy Distribution
            </CardTitle>
            <Badge variant="secondary">
              {stats.occupiedBeds ?? 0} Occupied / {stats.totalBeds ?? 0} Total
            </Badge>
          </CardHeader>
          <CardContent className="p-4 h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={occupancyPieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {occupancyPieData.map((entry: any, index: number) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={entry.color || (index === 0 ? "#4f46e5" : "#10b981")}
                    />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Complaints Category Distribution */}
        <Card>
          <CardHeader className="p-4 border-b border-slate-100">
            <CardTitle className="text-sm font-bold text-slate-800">
              Complaints by Category
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={
                  charts.complaintCategoryData && charts.complaintCategoryData.length > 0
                    ? charts.complaintCategoryData
                    : [
                        { category: "Electrical", count: 2 },
                        { category: "Plumbing", count: 1 },
                        { category: "Wi-Fi", count: 3 },
                        { category: "Room", count: 1 },
                      ]
                }
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 3. Action Items Queue (Leaves Awaiting Review & Latest Complaints) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leaves Awaiting Review */}
        <Card>
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                Leave Requests Awaiting Review
              </CardTitle>
            </div>
            <Link
              href="/admin/leaves"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all ({stats.pendingLeaves ?? 0}) &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-slate-100">
            {(!actionItems.recentLeaves || actionItems.recentLeaves.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No leave requests awaiting approval.
              </p>
            ) : (
              actionItems.recentLeaves.map((leave: any) => (
                <div key={leave._id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-xs font-bold text-slate-900">
                        {leave.studentId?.name || "Student"} ({leave.leaveType} Leave)
                      </p>
                      <p className="text-[11px] text-slate-500">
                        {formatDate(leave.startDate)} to {formatDate(leave.endDate)} • {leave.destination}
                      </p>
                      <p className="text-[11px] text-slate-600 mt-1 italic">
                        "{leave.reason}"
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 ml-3">
                      <button
                        onClick={() => handleQuickReviewLeave(leave._id, "Approved")}
                        className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 hover:bg-emerald-100 text-xs font-semibold border border-emerald-200 transition"
                      >
                        Approve
                      </button>
                      <button
                        onClick={() => handleQuickReviewLeave(leave._id, "Rejected")}
                        className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 hover:bg-rose-100 text-xs font-semibold border border-rose-200 transition"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>

        {/* Recent Maintenance Complaints */}
        <Card>
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                Recent Maintenance Tickets
              </CardTitle>
            </div>
            <Link
              href="/admin/complaints"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              View all ({stats.pendingComplaints ?? 0}) &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-slate-100">
            {(!actionItems.recentComplaints || actionItems.recentComplaints.length === 0) ? (
              <p className="text-xs text-slate-400 py-6 text-center">
                No active complaints filed.
              </p>
            ) : (
              actionItems.recentComplaints.map((c: any) => (
                <div key={c._id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                          {c.category}
                        </span>
                        <p className="text-xs font-bold text-slate-900">{c.subject}</p>
                      </div>
                      <p className="text-[11px] text-slate-500 mt-0.5">
                        By {c.studentId?.name || "Student"} • {formatDate(c.createdAt)}
                      </p>
                    </div>
                    <Badge
                      variant={
                        c.status === "Resolved"
                          ? "success"
                          : c.status === "In Progress"
                          ? "info"
                          : "warning"
                      }
                    >
                      {c.status}
                    </Badge>
                  </div>
                </div>
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 4. Administrative Audit History Feed */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <CardTitle className="text-sm font-bold text-slate-800">
              System Audit Trail Log
            </CardTitle>
          </div>
          <Link
            href="/admin/settings"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Full Audit Logs &rarr;
          </Link>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-slate-100">
          {(!actionItems.recentAuditLogs || actionItems.recentAuditLogs.length === 0) ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent audit logs.</p>
          ) : (
            actionItems.recentAuditLogs.map((log: any) => (
              <div key={log._id} className="py-2.5 first:pt-0 last:pb-0 flex items-center justify-between text-xs">
                <div>
                  <span className="font-mono font-bold text-slate-800 text-[11px]">
                    {log.action}
                  </span>{" "}
                  <span className="text-slate-500">on {log.resource}</span>
                  {log.userEmail && (
                    <span className="text-slate-400 text-[11px]"> by {log.userEmail}</span>
                  )}
                </div>
                <span className="text-[10px] text-slate-400">
                  {formatDateTime(log.createdAt)}
                </span>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
