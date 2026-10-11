"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Users, Search, Filter, Bed, Phone, Mail, CheckCircle2, XCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export default function AdminStudentsPage() {
  const [students, setStudents] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [department, setDepartment] = useState("");
  const [isAllocated, setIsAllocated] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchStudents = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.append("search", search);
      if (department) params.append("department", department);
      if (isAllocated) params.append("isAllocated", isAllocated);

      const res = await fetch(`/api/students?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setStudents(data.students || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents();
  }, [department, isAllocated]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchStudents();
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Student Directory</h1>
          <p className="text-xs text-slate-500 mt-1">
            Manage student registrations, academic information, and residential status
          </p>
        </div>
        <Link href="/admin/rooms">
          <Button size="sm" className="gap-2">
            <Bed className="w-4 h-4" /> Go to Room Allocations
          </Button>
        </Link>
      </div>

      {/* Filter and Search */}
      <Card className="p-4">
        <form onSubmit={handleSearchSubmit} className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1">
            <Input
              placeholder="Search by name, roll number, or email..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-2">
            <select
              value={department}
              onChange={(e) => setDepartment(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Departments</option>
              <option value="Computer Science">Computer Science</option>
              <option value="Mechanical Eng">Mechanical Eng</option>
              <option value="Electrical Eng">Electrical Eng</option>
              <option value="Civil Eng">Civil Eng</option>
              <option value="Biotechnology">Biotechnology</option>
            </select>

            <select
              value={isAllocated}
              onChange={(e) => setIsAllocated(e.target.value)}
              className="text-xs rounded-lg border border-slate-300 bg-white px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand-500"
            >
              <option value="">All Allocations</option>
              <option value="true">Allocated Beds</option>
              <option value="false">Unallocated</option>
            </select>

            <Button type="submit" variant="secondary" size="sm">
              Search
            </Button>
          </div>
        </form>
      </Card>

      {/* Students Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {students.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No students match the selected filters.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Student Details</th>
                  <th className="px-6 py-3.5">Department & Year</th>
                  <th className="px-6 py-3.5">Room & Bed</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {students.map((student) => {
                  const prof = student.profile;
                  return (
                    <tr key={student._id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs shrink-0">
                            {student.name[0]?.toUpperCase()}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 text-sm leading-tight">
                              {student.name}
                            </p>
                            <p className="text-[11px] text-slate-500 mt-0.5">
                              {student.studentId}
                            </p>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <p className="font-semibold text-slate-800">{prof?.department || "N/A"}</p>
                        <p className="text-[11px] text-slate-500">{prof?.academicYear || "Enrolled"}</p>
                      </td>
                      <td className="px-6 py-4">
                        {prof?.isAllocated ? (
                          <div>
                            <span className="font-bold text-slate-900">
                              Room {prof.roomId?.roomNumber || "N/A"}
                            </span>
                            <p className="text-[11px] text-slate-500">
                              Bed {prof.bedId?.bedNumber || "N/A"} • {prof.hostelId?.name || "Hostel"}
                            </p>
                          </div>
                        ) : (
                          <span className="text-amber-600 font-medium bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
                            Unallocated
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-slate-600">
                        <p>{student.email}</p>
                        <p className="text-[11px] text-slate-400">{student.phone || "No phone"}</p>
                      </td>
                      <td className="px-6 py-4">
                        <Badge variant={student.isActive ? "success" : "danger"}>
                          {student.isActive ? "Active" : "Inactive"}
                        </Badge>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {!prof?.isAllocated ? (
                          <Link href="/admin/rooms">
                            <button className="px-2.5 py-1 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs transition border border-brand-200">
                              Allocate Bed
                            </button>
                          </Link>
                        ) : (
                          <Link href="/admin/rooms">
                            <button className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition">
                              Manage Room
                            </button>
                          </Link>
                        )}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
