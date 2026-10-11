"use client";

import React, { useState, useEffect } from "react";
import { CalendarCheck2, CheckCircle, XCircle, Search, Users, CheckCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function AdminAttendancePage() {
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [department, setDepartment] = useState("");
  const [search, setSearch] = useState("");
  const [data, setData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [message, setMessage] = useState("");

  const fetchAttendance = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      params.append("date", date);
      if (department) params.append("department", department);

      const res = await fetch(`/api/attendance?${params.toString()}`);
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
    fetchAttendance();
  }, [date, department]);

  const handleMark = async (studentId: string, status: "Present" | "Absent") => {
    try {
      const res = await fetch("/api/attendance", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, date, status, remarks: "Roll call" }),
      });
      if (res.ok) {
        // Optimistically update
        setData((prev: any) => {
          if (!prev) return prev;
          const updatedStudents = prev.students.map((s: any) =>
            s.studentId === studentId ? { ...s, status } : s
          );
          return { ...prev, students: updatedStudents };
        });
        fetchAttendance();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBulkMarkPresent = async () => {
    if (!data?.students) return;
    const unmarked = data.students.filter((s: any) => s.status !== "Present");
    if (unmarked.length === 0) {
      alert("All students are already marked Present!");
      return;
    }

    try {
      const records = unmarked.map((s: any) => ({
        studentId: s.studentId,
        status: "Present",
        remarks: "Bulk marked roll-call",
      }));

      const res = await fetch("/api/attendance/bulk", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ date, records }),
      });

      if (res.ok) {
        setMessage(`Marked ${unmarked.length} students as Present.`);
        setTimeout(() => setMessage(""), 3000);
        fetchAttendance();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const studentsList = (data?.students || []).filter((s: any) => {
    if (!search) return true;
    return (
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.rollNumber.toLowerCase().includes(search.toLowerCase()) ||
      s.roomNumber.toLowerCase().includes(search.toLowerCase())
    );
  });

  const stats = data?.stats || {
    totalStudents: 0,
    presentCount: 0,
    absentCount: 0,
    unmarkedCount: 0,
    presentPercentage: 0,
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Daily Attendance Roll-Call</h1>
          <p className="text-xs text-slate-500 mt-1">
            Conduct night roll-call verification, mark individual attendance, or bulk approve
          </p>
        </div>
        <Button onClick={handleBulkMarkPresent} className="gap-2 shrink-0">
          <CheckCheck className="w-4 h-4" /> Mark All Present
        </Button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl">
          {message}
        </div>
      )}

      {/* Date & Stats Header */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        <Card className="p-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Selected Date</p>
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="text-xs font-bold text-slate-900 border-none bg-transparent p-0 mt-1 focus:ring-0 cursor-pointer"
          />
        </Card>

        <Card className="p-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Total Students</p>
          <p className="text-xl font-extrabold text-slate-900 mt-0.5">{stats.totalStudents}</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Present</p>
          <p className="text-xl font-extrabold text-emerald-600 mt-0.5">{stats.presentCount}</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Absent</p>
          <p className="text-xl font-extrabold text-rose-600 mt-0.5">{stats.absentCount}</p>
        </Card>

        <Card className="p-3.5">
          <p className="text-[10px] font-bold text-slate-400 uppercase">Compliance</p>
          <p className="text-xl font-extrabold text-brand-600 mt-0.5">
            {stats.presentPercentage}%
          </p>
        </Card>
      </div>

      {/* Search and Filters */}
      <Card className="p-3.5 flex flex-col sm:flex-row gap-3">
        <div className="flex-1">
          <Input
            placeholder="Search by student name, roll number, or room..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <select
          value={department}
          onChange={(e) => setDepartment(e.target.value)}
          className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2"
        >
          <option value="">All Departments</option>
          <option value="Computer Science">Computer Science</option>
          <option value="Mechanical Eng">Mechanical Eng</option>
          <option value="Electrical Eng">Electrical Eng</option>
        </select>
      </Card>

      {/* Attendance Sheet Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {studentsList.length === 0 ? (
            <div className="p-10 text-center text-slate-400 text-xs">
              No students found for attendance marking.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Department</th>
                  <th className="px-6 py-3.5">Room</th>
                  <th className="px-6 py-3.5">Current Status</th>
                  <th className="px-6 py-3.5 text-right">Mark Attendance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {studentsList.map((student: any) => (
                  <tr key={student.studentId} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-3.5 font-medium text-slate-900">
                      <p className="font-bold">{student.name}</p>
                      <p className="text-[11px] text-slate-500">{student.rollNumber}</p>
                    </td>
                    <td className="px-6 py-3.5 text-slate-600">{student.department}</td>
                    <td className="px-6 py-3.5 font-semibold text-slate-800">
                      Room {student.roomNumber}
                    </td>
                    <td className="px-6 py-3.5">
                      <Badge
                        variant={
                          student.status === "Present"
                            ? "success"
                            : student.status === "Absent"
                            ? "danger"
                            : "secondary"
                        }
                      >
                        {student.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <div className="inline-flex rounded-lg border border-slate-200 bg-slate-50 p-1">
                        <button
                          onClick={() => handleMark(student.studentId, "Present")}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                            student.status === "Present"
                              ? "bg-emerald-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-emerald-700 hover:bg-emerald-50"
                          }`}
                        >
                          Present
                        </button>
                        <button
                          onClick={() => handleMark(student.studentId, "Absent")}
                          className={`px-3 py-1 rounded-md text-xs font-bold transition ${
                            student.status === "Absent"
                              ? "bg-rose-600 text-white shadow-xs"
                              : "text-slate-600 hover:text-rose-700 hover:bg-rose-50"
                          }`}
                        >
                          Absent
                        </button>
                      </div>
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
