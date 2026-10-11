"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck2, CheckCircle, XCircle, Calendar, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDate } from "@/lib/utils";

export default function StudentAttendancePage() {
  const [attendanceData, setAttendanceData] = useState<any>(null);
  const [filterMonth, setFilterMonth] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/attendance")
      .then((res) => res.json())
      .then((data) => setAttendanceData(data))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const stats = attendanceData?.stats || {
    totalRecorded: 0,
    presentDays: 0,
    absentDays: 0,
    percentage: 100,
  };

  const records = attendanceData?.records || [];

  const filteredRecords = records.filter((r: any) => {
    if (filterMonth === "ALL") return true;
    return r.date.startsWith(filterMonth);
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Attendance Records</h1>
        <p className="text-xs text-slate-500 mt-1">
          Monitor your daily hostel roll-call attendance and overall institutional compliance
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Attendance Rate
          </p>
          <p
            className={`text-2xl font-extrabold mt-1 ${
              stats.percentage >= 75 ? "text-emerald-600" : "text-rose-600"
            }`}
          >
            {stats.percentage}%
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {stats.percentage >= 75 ? "Compliant (≥ 75%)" : "Shortage (< 75%)"}
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Recorded Days
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {stats.totalRecorded}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Academic cycle</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Days Present
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {stats.presentDays}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Verified in hostel</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Days Absent
          </p>
          <p className="text-2xl font-extrabold text-rose-600 mt-1">
            {stats.absentDays}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Approved leave or absent</p>
        </Card>
      </div>

      {/* Attendance History Table */}
      <Card>
        <CardHeader className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100">
          <CardTitle className="text-base font-bold text-slate-800 flex items-center gap-2">
            <CalendarCheck2 className="w-4 h-4 text-brand-600" />
            Roll-Call History
          </CardTitle>

          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">Filter Month:</span>
            <select
              value={filterMonth}
              onChange={(e) => setFilterMonth(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="ALL">All Recorded Dates</option>
              <option value="2026-10">October 2026</option>
              <option value="2026-09">September 2026</option>
              <option value="2026-08">August 2026</option>
            </select>
          </div>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {filteredRecords.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No attendance records found for this period.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3">Date</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Remarks / Verification</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredRecords.map((record: any) => (
                  <tr key={record._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-800">
                      {formatDate(record.date)}
                    </td>
                    <td className="px-6 py-3.5">
                      {record.status === "Present" ? (
                        <span className="inline-flex items-center gap-1.5 text-emerald-700 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/60">
                          <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                          Present
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1.5 text-rose-700 font-semibold bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/60">
                          <XCircle className="w-3.5 h-3.5 text-rose-600" />
                          Absent
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-3.5 text-slate-500">
                      {record.remarks || "Regular biometric / warden roll-call"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
