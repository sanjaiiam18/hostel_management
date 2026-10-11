"use client";

import React, { useState, useEffect } from "react";
import { Users2, LogIn, LogOut, CheckCircle2, XCircle, Search, Clock } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function AdminVisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState("ALL");

  // Check In/Out Modal State
  const [selectedVisitor, setSelectedVisitor] = useState<any>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState("Checked In");
  const [actualTime, setActualTime] = useState("");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVisitors = async () => {
    setIsLoading(true);
    try {
      const url = filterStatus === "ALL" ? "/api/visitors" : `/api/visitors?status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, [filterStatus]);

  const handleQuickStatus = async (visitor: any, status: string) => {
    try {
      const currentTime = new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
      const payload: any = { status };
      if (status === "Checked In") payload.actualEntryTime = currentTime;
      if (status === "Checked Out") payload.actualExitTime = currentTime;

      const res = await fetch(`/api/visitors/${visitor._id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        fetchVisitors();
      }
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Campus Visitor & Security Gate</h1>
          <p className="text-xs text-slate-500 mt-1">
            Authorize visitor requests and log security entry/exit timestamps
          </p>
        </div>

        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {["ALL", "Pending", "Approved", "Checked In", "Checked Out", "Rejected"].map((st) => (
            <button
              key={st}
              onClick={() => setFilterStatus(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                filterStatus === st
                  ? "bg-brand-600 text-white shadow-xs"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Visitors Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {visitors.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No visitor passes found for this filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Visitor Name & Relation</th>
                  <th className="px-6 py-3.5">Host Student</th>
                  <th className="px-6 py-3.5">Visit Date & Hours</th>
                  <th className="px-6 py-3.5">Actual Security Times</th>
                  <th className="px-6 py-3.5">Pass Status</th>
                  <th className="px-6 py-3.5 text-right">Gate Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visitors.map((v) => (
                  <tr key={v._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <p className="font-bold">{v.visitorName}</p>
                      <p className="text-[11px] text-slate-500">
                        {v.relationship} • {v.phoneNumber}
                      </p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{v.studentId?.name || "Student"}</p>
                      <p className="text-[11px] text-slate-500">{v.studentId?.studentId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{formatDate(v.visitDate)}</p>
                      <p className="text-[11px] text-slate-500">
                        Exp: {v.expectedEntryTime} – {v.expectedExitTime}
                      </p>
                    </td>
                    <td className="px-6 py-4 text-slate-600">
                      {v.actualEntryTime ? (
                        <p className="text-emerald-700 font-medium">
                          In: {v.actualEntryTime}
                        </p>
                      ) : (
                        <span className="text-slate-400">Not arrived</span>
                      )}
                      {v.actualExitTime && (
                        <p className="text-slate-500 font-medium">Out: {v.actualExitTime}</p>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          v.status === "Checked In"
                            ? "success"
                            : v.status === "Approved"
                            ? "info"
                            : v.status === "Checked Out"
                            ? "secondary"
                            : v.status === "Rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {v.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {v.status === "Pending" && (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickStatus(v, "Approved")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 text-emerald-700 font-bold border border-emerald-200 text-xs"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => handleQuickStatus(v, "Rejected")}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 text-rose-700 font-bold border border-rose-200 text-xs"
                          >
                            Reject
                          </button>
                        </div>
                      )}

                      {v.status === "Approved" && (
                        <button
                          onClick={() => handleQuickStatus(v, "Checked In")}
                          className="px-3 py-1 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-xs"
                        >
                          Check In Now
                        </button>
                      )}

                      {v.status === "Checked In" && (
                        <button
                          onClick={() => handleQuickStatus(v, "Checked Out")}
                          className="px-3 py-1 rounded-lg bg-slate-800 hover:bg-slate-900 text-white font-bold text-xs shadow-xs"
                        >
                          Check Out Now
                        </button>
                      )}

                      {v.status === "Checked Out" && (
                        <span className="text-[11px] text-slate-400 italic">Visit Completed</span>
                      )}
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
