"use client";

import React, { useState, useEffect } from "react";
import { CalendarClock, CheckCircle2, XCircle, Clock, Check, X } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

export default function AdminLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Review Modal State
  const [selectedLeave, setSelectedLeave] = useState<any>(null);
  const [reviewStatus, setReviewStatus] = useState<"Approved" | "Rejected">("Approved");
  const [remarks, setRemarks] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const url = filterStatus === "ALL" ? "/api/leaves" : `/api/leaves?status=${filterStatus}`;
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.leaves || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [filterStatus]);

  const openReviewModal = (leave: any, status: "Approved" | "Rejected") => {
    setSelectedLeave(leave);
    setReviewStatus(status);
    setRemarks(status === "Approved" ? "Leave granted. Adhere to hostel return timing." : "Parent contact unverified.");
    setIsModalOpen(true);
  };

  const handleReviewSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedLeave) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/leaves/${selectedLeave._id}/review`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: reviewStatus, remarks }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchLeaves();
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Student Leave Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Review residential outpass and home-visit applications submitted by students
          </p>
        </div>

        {/* Filter Pills */}
        <div className="flex gap-1.5 bg-white p-1 rounded-xl border border-slate-200">
          {["ALL", "Pending", "Approved", "Rejected"].map((st) => (
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

      {/* Review Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={`${reviewStatus} Leave Request`}
        description={`Record administrative decision for ${selectedLeave?.studentId?.name}`}
      >
        <form onSubmit={handleReviewSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
            <p className="font-bold text-slate-900">
              {selectedLeave?.leaveType} Leave • {selectedLeave?.destination}
            </p>
            <p className="text-slate-600">
              Period: {formatDate(selectedLeave?.startDate)} &rarr; {formatDate(selectedLeave?.endDate)}
            </p>
            <p className="text-slate-600">Parent Phone: {selectedLeave?.parentContact}</p>
            <p className="text-slate-500 italic mt-1">"{selectedLeave?.reason}"</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Warden Remarks
            </label>
            <textarea
              rows={3}
              value={remarks}
              onChange={(e) => setRemarks(e.target.value)}
              placeholder="Add instructions or reason for decision..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant={reviewStatus === "Approved" ? "success" : "danger"}
              isLoading={isSubmitting}
            >
              Confirm {reviewStatus}
            </Button>
          </div>
        </form>
      </Modal>

      {/* Leaves Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {leaves.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No leave requests found for this status filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Student</th>
                  <th className="px-6 py-3.5">Leave Type & Destination</th>
                  <th className="px-6 py-3.5">Travel Dates</th>
                  <th className="px-6 py-3.5">Reason & Parent</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Review Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {leaves.map((leave) => (
                  <tr key={leave._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <p className="font-bold">{leave.studentId?.name || "Student"}</p>
                      <p className="text-[11px] text-slate-500">{leave.studentId?.studentId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{leave.leaveType} Leave</p>
                      <p className="text-[11px] text-slate-500">{leave.destination}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">
                        {formatDate(leave.startDate)} &rarr; {formatDate(leave.endDate)}
                      </p>
                      <p className="text-[10px] text-slate-400">
                        Applied {formatDate(leave.createdAt)}
                      </p>
                    </td>
                    <td className="px-6 py-4 max-w-xs">
                      <p className="text-slate-700 truncate">{leave.reason}</p>
                      <p className="text-[11px] text-slate-400">Parent: {leave.parentContact}</p>
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          leave.status === "Approved"
                            ? "success"
                            : leave.status === "Rejected"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {leave.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {leave.status === "Pending" ? (
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => openReviewModal(leave, "Approved")}
                            className="px-2.5 py-1 rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold border border-emerald-200 transition"
                          >
                            Approve
                          </button>
                          <button
                            onClick={() => openReviewModal(leave, "Rejected")}
                            className="px-2.5 py-1 rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 font-bold border border-rose-200 transition"
                          >
                            Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-[11px] text-slate-400 italic">
                          Reviewed by {leave.reviewedBy?.name || "Warden"}
                        </span>
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
