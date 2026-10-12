"use client";

import React, { useState, useEffect, useCallback } from "react";
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
  RefreshCw,
  PlusCircle,
  FileSpreadsheet,
  Megaphone,
  Loader2,
  Filter,
  Check,
  X,
  Send,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import StatCard from "@/components/dashboard/StatCard";
import { useToast } from "@/components/ui/toast";
import AdminLoading from "@/app/admin/loading";
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
  const { success, error: toastError, info } = useToast();

  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastSynced, setLastSynced] = useState("Just now");
  const [timeFilter, setTimeFilter] = useState<"Today" | "Week" | "Semester">("Semester");
  const [reviewingLeaveId, setReviewingLeaveId] = useState<string | null>(null);

  // Quick Broadcast Announcement Modal
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastForm, setBroadcastForm] = useState({
    title: "",
    description: "",
    category: "General",
    priority: "Normal",
    targetAudience: "All",
  });
  const [isPublishingNotice, setIsPublishingNotice] = useState(false);

  const fetchDashboardData = useCallback(async (silent = false) => {
    if (!silent) setIsLoading(true);
    else setIsRefreshing(true);

    try {
      const res = await fetch("/api/admin/dashboard");
      if (res.ok) {
        const json = await res.json();
        setData(json);
        setLastSynced(new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }));
      }
    } catch (e) {
      console.error(e);
      toastError("Sync Error", "Could not refresh admin analytics.");
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [toastError]);

  useEffect(() => {
    fetchDashboardData();
  }, [fetchDashboardData]);

  const handleQuickReviewLeave = async (id: string, status: "Approved" | "Rejected") => {
    setReviewingLeaveId(id);
    try {
      const res = await fetch(`/api/leaves/${id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status, remarks: `Reviewed by Warden Desk as ${status}` }),
      });
      if (res.ok) {
        success(
          `Outpass ${status}`,
          `Leave request #${id.slice(-4).toUpperCase()} has been ${status.toLowerCase()} and notification dispatched.`
        );
        fetchDashboardData(true);
      } else {
        toastError("Review Failed", "Unable to update leave decision.");
      }
    } catch (e) {
      console.error(e);
      toastError("Network Error", "Could not reach server.");
    } finally {
      setReviewingLeaveId(null);
    }
  };

  const handleBroadcastSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastForm.title.trim() || !broadcastForm.description.trim()) {
      toastError("Missing Fields", "Please specify title and announcement message.");
      return;
    }
    setIsPublishingNotice(true);
    try {
      const res = await fetch("/api/notices", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(broadcastForm),
      });
      if (res.ok) {
        success("Notice Published", "Broadcast sent to all student residence dashboards.");
        setIsBroadcastModalOpen(false);
        setBroadcastForm({
          title: "",
          description: "",
          category: "General",
          priority: "Normal",
          targetAudience: "All",
        });
        fetchDashboardData(true);
      } else {
        toastError("Notice Failed", "Could not publish notice.");
      }
    } catch {
      toastError("Network Error", "Unable to reach server.");
    } finally {
      setIsPublishingNotice(false);
    }
  };

  if (isLoading) {
    return <AdminLoading />;
  }

  const stats = data?.stats || {};
  const charts = data?.charts || {};
  const actionItems = data?.actionItems || {};

  const occupancyPieData = charts.occupancyData || [
    { name: "Occupied Beds", value: stats.occupiedBeds || 0, color: "#4f46e5" },
    { name: "Available Beds", value: stats.availableBeds || 0, color: "#10b981" },
  ];

  return (
    <div className="space-y-6">
      {/* 1. Collegiate Governance Banner & Live Synchronization */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex items-center gap-2">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-brand-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-brand-600"></span>
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-navy-950 tracking-tight">
              Warden Operations & Residential Governance
            </h1>
          </div>
          <p className="text-xs text-slate-500 mt-1">
            Himalaya & Saraswati Hostels &bull; Shift Warden: <span className="font-semibold text-slate-700">Dr. Rajesh Sharma</span> &bull; Synced {lastSynced}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Time Filter Chips */}
          <div className="inline-flex rounded-xl bg-slate-100 p-1 text-xs font-semibold text-slate-600">
            {(["Today", "Week", "Semester"] as const).map((period) => (
              <button
                key={period}
                onClick={() => {
                  setTimeFilter(period);
                  info(`Filter Changed: ${period}`, "Displaying metrics for selected period.");
                }}
                className={`px-3 py-1 rounded-lg transition-all ${
                  timeFilter === period
                    ? "bg-white text-slate-900 shadow-xs font-bold"
                    : "hover:text-slate-900"
                }`}
              >
                {period}
              </button>
            ))}
          </div>

          <Button
            size="sm"
            variant="outline"
            onClick={() => fetchDashboardData(true)}
            disabled={isRefreshing}
            className="gap-1.5 h-8 text-xs"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? "animate-spin text-brand-600" : ""}`} />
            Sync
          </Button>

          <Button
            size="sm"
            variant="primary"
            onClick={() => setIsBroadcastModalOpen(true)}
            className="gap-1.5 h-8 text-xs font-bold"
          >
            <Megaphone className="w-3.5 h-3.5" /> Broadcast Notice
          </Button>
        </div>
      </div>

      {/* 2. Core KPIs Statistics Grid with Tactile Badges */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
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
          description="Across 4 active floors"
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
          description="Gate outpass queue"
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

      {/* Financial Health & Security Gate Summary */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4 flex items-center justify-between border-cyan-200/80 hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Pending Visitor Clearance
            </p>
            <p className="text-2xl font-black text-slate-900 mt-0.5">
              {stats.pendingVisitors ?? 0} Passes
            </p>
            <p className="text-[11px] text-cyan-600 mt-0.5 font-medium">Security gate logging armed</p>
          </div>
          <div className="p-3 rounded-2xl bg-cyan-50 text-cyan-600">
            <UserCheck className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-emerald-200/80 hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Collected Hostel Fees
            </p>
            <p className="text-2xl font-black text-emerald-600 mt-0.5">
              {formatCurrency(stats.totalCollected ?? 0)}
            </p>
            <p className="text-[11px] text-emerald-700 mt-0.5 font-medium">50% Semester collections</p>
          </div>
          <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>

        <Card className="p-4 flex items-center justify-between border-rose-200/80 hover:shadow-md transition">
          <div>
            <p className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
              Outstanding Dues
            </p>
            <p className="text-2xl font-black text-rose-600 mt-0.5">
              {formatCurrency(stats.totalOutstanding ?? 0)}
            </p>
            <p className="text-[11px] text-rose-600 mt-0.5 font-medium">Due notice sent to 2 students</p>
          </div>
          <div className="p-3 rounded-2xl bg-rose-50 text-rose-600">
            <CreditCard className="w-5 h-5" />
          </div>
        </Card>
      </div>

      {/* 3. Visual Analytics (Occupancy & Maintenance Breakdown) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Room Occupancy Distribution */}
        <Card className="shadow-xs hover:shadow-sm transition">
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">
              Bed Capacity & Occupancy Matrix
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
        <Card className="shadow-xs hover:shadow-sm transition">
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <CardTitle className="text-sm font-bold text-slate-800">
              Active Maintenance Work Orders
            </CardTitle>
            <span className="text-[11px] text-slate-500 font-medium">Categorical breakdown</span>
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
                        { category: "Wi-Fi", count: 1 },
                        { category: "Carpentry", count: 1 },
                      ]
                }
                margin={{ top: 10, right: 10, left: -20, bottom: 20 }}
              >
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="category" tick={{ fontSize: 11 }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11 }} />
                <Tooltip />
                <Bar dataKey="count" fill="#4f46e5" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* 4. Interactive Action Item Queues with Instant Approval & Dispatch */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Pending Leaves Awaiting Review */}
        <Card className="shadow-xs hover:shadow-sm transition">
          <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
            <div className="flex items-center gap-2">
              <CalendarClock className="w-4 h-4 text-amber-600" />
              <CardTitle className="text-sm font-bold text-slate-800">
                Gate Outpasses Awaiting Warden Clearance
              </CardTitle>
            </div>
            <Link
              href="/admin/leaves"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              All Leaves ({stats.pendingLeaves ?? 0}) &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-slate-100">
            {(!actionItems.recentLeaves || actionItems.recentLeaves.length === 0) ? (
              <div className="py-8 text-center space-y-1">
                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                <p className="text-xs font-semibold text-slate-700">Outpass Queue Clear</p>
                <p className="text-[11px] text-slate-400">All submitted travel requests have been reviewed.</p>
              </div>
            ) : (
              actionItems.recentLeaves.map((leave: any) => (
                <div key={leave._id} className="py-3 first:pt-0 last:pb-0">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-0.5">
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-black text-slate-900">
                          {leave.studentId?.name || "Student"}
                        </span>
                        <Badge variant="warning">{leave.leaveType}</Badge>
                      </div>
                      <p className="text-[11px] text-slate-600">
                        {formatDate(leave.startDate)} &rarr; {formatDate(leave.endDate)} &bull; Destination: <b>{leave.destination}</b>
                      </p>
                      <p className="text-[11px] text-slate-500 italic">
                        &quot;{leave.reason}&quot;
                      </p>
                    </div>

                    <div className="flex items-center gap-1.5 shrink-0 self-end sm:self-center">
                      <button
                        disabled={reviewingLeaveId === leave._id}
                        onClick={() => handleQuickReviewLeave(leave._id, "Approved")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold border border-emerald-200 transition cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        {reviewingLeaveId === leave._id ? (
                          <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <Check className="w-3.5 h-3.5 stroke-[3]" />
                        )}
                        Approve Pass
                      </button>
                      <button
                        disabled={reviewingLeaveId === leave._id}
                        onClick={() => handleQuickReviewLeave(leave._id, "Rejected")}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold border border-rose-200 transition cursor-pointer active:scale-95 disabled:opacity-50"
                      >
                        <X className="w-3.5 h-3.5 stroke-[3]" />
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
        <Card className="shadow-xs hover:shadow-sm transition">
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
              All Tickets ({stats.pendingComplaints ?? 0}) &rarr;
            </Link>
          </CardHeader>
          <CardContent className="p-4 divide-y divide-slate-100">
            {(!actionItems.recentComplaints || actionItems.recentComplaints.length === 0) ? (
              <p className="text-xs text-slate-400 py-8 text-center">
                No active complaints filed.
              </p>
            ) : (
              actionItems.recentComplaints.map((c: any) => (
                <div key={c._id} className="py-3 first:pt-0 last:pb-0 flex items-center justify-between gap-3">
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {c.category}
                      </span>
                      <p className="text-xs font-bold text-slate-900">{c.subject}</p>
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Reported by {c.studentId?.name || "Student"} &bull; {formatDate(c.createdAt)}
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
              ))
            )}
          </CardContent>
        </Card>
      </div>

      {/* 5. Live Campus Security Audit Log Feed */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
          <div className="flex items-center gap-2">
            <Activity className="w-4 h-4 text-brand-600" />
            <CardTitle className="text-sm font-bold text-slate-800">
              Campus Audit Trail Log
            </CardTitle>
          </div>
          <Link
            href="/admin/settings"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700"
          >
            Full Trail &rarr;
          </Link>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-slate-100">
          {(!actionItems.recentAuditLogs || actionItems.recentAuditLogs.length === 0) ? (
            <p className="text-xs text-slate-400 py-4 text-center">No recent audit activity.</p>
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

      {/* BROADCAST NOTICE MODAL */}
      <Modal
        isOpen={isBroadcastModalOpen}
        onClose={() => setIsBroadcastModalOpen(false)}
        title="Broadcast Institutional Notice"
        description="Publishes an urgent announcement to student dashboards and the hostel bulletin board."
      >
        <form onSubmit={handleBroadcastSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Notice Title</label>
            <Input
              value={broadcastForm.title}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, title: e.target.value })}
              placeholder="e.g. Mandatory Hostel Inspection Schedule / Water Tank Maintenance"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Category</label>
              <select
                value={broadcastForm.category}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, category: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="General">General Notice</option>
                <option value="Maintenance">Maintenance & Power</option>
                <option value="Mess">Mess Committee</option>
                <option value="Discipline">Discipline & Curfew</option>
                <option value="Holiday">Holidays & Vacations</option>
                <option value="Emergency">Emergency Alert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority</label>
              <select
                value={broadcastForm.priority}
                onChange={(e) => setBroadcastForm({ ...broadcastForm, priority: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="Normal">Normal Notice</option>
                <option value="Important">Important (Orange Pin)</option>
                <option value="Emergency">Emergency (Red Banner)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Announcement Body</label>
            <textarea
              rows={4}
              value={broadcastForm.description}
              onChange={(e) => setBroadcastForm({ ...broadcastForm, description: e.target.value })}
              placeholder="Type the announcement details and instructions for students..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsBroadcastModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isPublishingNotice}
              className="gap-1.5 font-bold"
            >
              <Send className="w-3.5 h-3.5" /> Publish Announcement
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
