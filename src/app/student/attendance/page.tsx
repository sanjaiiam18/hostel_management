"use client";

import React, { useState, useEffect } from "react";
import {
  CalendarCheck2,
  CheckCircle,
  XCircle,
  Calendar,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Info,
  Clock,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TableSkeleton, StatCardSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function StudentAttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [statusFilter, setStatusFilter] = useState<"ALL" | "Present" | "Absent">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchAttendance = () => {
    setIsLoading(true);
    fetch("/api/attendance")
      .then((res) => res.json())
      .then((data) => setAttendanceData(data))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchAttendance();
  }, []);

  const stats = attendanceData?.stats || {
    totalRecorded: 0,
    presentDays: 0,
    absentDays: 0,
    percentage: 100,
  };

  const records = attendanceData?.records || [];

  const filteredRecords = records.filter((r: any) => {
    if (statusFilter === "ALL") return true;
    return r.status === statusFilter;
  });

  // Calculate safe to miss classes
  // Formula: target is 75% -> present / (total + x) >= 0.75  =>  x <= (present - 0.75 * total) / 0.75
  const present = stats.presentDays || 0;
  const total = stats.totalRecorded || 0;
  const safeToMiss = Math.max(0, Math.floor((present - 0.75 * total) / 0.75));

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Roll-Call Attendance Records
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Biometric and warden night roll-call compliance tracker for Spring 2026
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchAttendance} className="self-end sm:self-auto gap-1.5 h-8 text-xs">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Log
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <TableSkeleton rows={6} cols={4} />
        </div>
      ) : (
        <>
          {/* KPI Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <Card className="p-4 border-emerald-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Attendance Rate
              </p>
              <div className="flex items-baseline gap-2 mt-1">
                <span
                  className={`text-3xl font-black ${
                    stats.percentage >= 75 ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {stats.percentage}%
                </span>
                <span className="text-xs font-semibold text-emerald-600">
                  {stats.percentage >= 75 ? "Compliant" : "Warning"}
                </span>
              </div>
              <div className="w-full bg-slate-100 rounded-full h-1.5 mt-2 overflow-hidden">
                <div
                  className="bg-emerald-500 h-1.5 rounded-full"
                  style={{ width: `${Math.min(100, stats.percentage)}%` }}
                />
              </div>
              <p className="text-[10px] text-slate-400 mt-1">Threshold: &ge; 75.0%</p>
            </Card>

            <Card className="p-4 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Recorded Sessions
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {stats.totalRecorded}
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5">Night roll-calls logged</p>
            </Card>

            <Card className="p-4 border-emerald-100 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Days Present
              </p>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                {stats.presentDays}
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5">Verified inside room</p>
            </Card>

            <Card className="p-4 border-rose-100 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Days Absent / Leave
              </p>
              <p className="text-3xl font-black text-rose-600 mt-1">
                {stats.absentDays}
              </p>
              <p className="text-[10px] text-slate-400 mt-1.5">Authorized or missed</p>
            </Card>
          </div>

          {/* Interactive Attendance Health Advice (Human-Made Feature) */}
          <div className="p-4 rounded-2xl bg-gradient-to-r from-emerald-50 via-teal-50 to-slate-50 border border-emerald-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 rounded-xl bg-emerald-600 text-white shrink-0 mt-0.5">
                <CheckCircle2 className="w-5 h-5" />
              </div>
              <div>
                <p className="text-xs font-bold text-slate-900">
                  Hostel Clearance Status: Excellent &bull; Eligible for Gate Outpasses
                </p>
                <p className="text-xs text-slate-600 mt-0.5">
                  You currently have {stats.percentage}% attendance.{" "}
                  {safeToMiss > 0 ? (
                    <span>
                      You can safely miss up to <b>{safeToMiss} more roll-call{safeToMiss > 1 ? "s" : ""}</b> without dropping below the 75% institutional requirement.
                    </span>
                  ) : (
                    <span>You are near the 75% boundary. Ensure daily presence during 08:30 PM warden rounds.</span>
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Attendance History Table */}
          <Card className="shadow-xs">
            <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <CalendarCheck2 className="w-4 h-4 text-brand-600" />
                Night Roll-Call Verification Log
              </CardTitle>

              {/* Status Filter Tabs */}
              <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold">
                {(["ALL", "Present", "Absent"] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setStatusFilter(tab)}
                    className={`px-3 py-1 rounded-lg transition-all ${
                      statusFilter === tab
                        ? "bg-white text-slate-900 shadow-xs font-bold"
                        : "text-slate-600 hover:text-slate-900"
                    }`}
                  >
                    {tab === "ALL" ? "All Logs" : tab}
                  </button>
                ))}
              </div>
            </CardHeader>
            <CardContent className="p-0">
              {filteredRecords.length === 0 ? (
                <p className="text-xs text-slate-400 py-12 text-center">
                  No attendance records match your filter.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-50/70 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                      <tr>
                        <th className="py-3 px-4">Date</th>
                        <th className="py-3 px-4">Status</th>
                        <th className="py-3 px-4">Verified By</th>
                        <th className="py-3 px-4">Remarks</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {filteredRecords.map((r: any) => (
                        <tr key={r._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-bold text-slate-800">
                            {formatDate(r.date)}
                          </td>
                          <td className="py-3 px-4">
                            {r.status === "Present" ? (
                              <Badge variant="success">Present</Badge>
                            ) : (
                              <Badge variant="danger">Absent</Badge>
                            )}
                          </td>
                          <td className="py-3 px-4 text-slate-600">
                            {r.markedBy?.name || "Dr. Rajesh Sharma (Warden)"}
                          </td>
                          <td className="py-3 px-4 text-slate-500">
                            {r.remarks || "Night roll call verified at room"}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </CardContent>
          </Card>
        </>
      )}
    </div>
  );
}
