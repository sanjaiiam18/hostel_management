"use client";

import React, { useState, useEffect } from "react";
import { CalendarClock, Plus, CheckCircle2, XCircle, Clock, AlertCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

export default function StudentLeavesPage() {
  const [leaves, setLeaves] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    leaveType: "Home",
    startDate: "",
    endDate: "",
    reason: "",
    parentContact: "",
    destination: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchLeaves = async () => {
    try {
      const res = await fetch("/api/leaves");
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      setFormError("End date must be on or after start date.");
      setIsSubmitting(false);
      return;
    }

    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit leave request");

      setIsModalOpen(false);
      setFormData({
        leaveType: "Home",
        startDate: "",
        endDate: "",
        reason: "",
        parentContact: "",
        destination: "",
      });
      fetchLeaves();
    } catch (err: any) {
      setFormError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Leave Requests</h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply for hostel outpass/leave and track warden approval status
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Apply for Leave
        </Button>
      </div>

      {/* Leave Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="New Leave Application"
        description="Submit your leave application for warden verification"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {formError}
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Leave Category
            </label>
            <select
              value={formData.leaveType}
              onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Home">Home Visit</option>
              <option value="Medical">Medical Leave</option>
              <option value="Personal">Personal Emergency</option>
              <option value="Other">Other Institutional Purpose</option>
            </select>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Departure Date"
              type="date"
              value={formData.startDate}
              onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
              required
            />
            <Input
              label="Expected Return Date"
              type="date"
              value={formData.endDate}
              onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Destination / City"
              placeholder="e.g. Home, Mumbai"
              value={formData.destination}
              onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
              required
            />
            <Input
              label="Parent Contact Phone"
              placeholder="+91 9876543210"
              value={formData.parentContact}
              onChange={(e) => setFormData({ ...formData, parentContact: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Detailed Reason for Leave
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Provide reason for warden approval..."
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
            <Button type="submit" isLoading={isSubmitting}>
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>

      {/* Leave Requests List */}
      <div className="space-y-4">
        {leaves.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <CalendarClock className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No leave requests found</p>
            <p className="text-xs text-slate-400 mt-1">
              Apply for leave using the button above when you need to travel outside the hostel.
            </p>
          </Card>
        ) : (
          leaves.map((leave) => (
            <Card key={leave._id} className="p-5 hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      leave.status === "Approved"
                        ? "bg-emerald-50 text-emerald-600"
                        : leave.status === "Rejected"
                        ? "bg-rose-50 text-rose-600"
                        : "bg-amber-50 text-amber-600"
                    }`}
                  >
                    {leave.status === "Approved" ? (
                      <CheckCircle2 className="w-5 h-5" />
                    ) : leave.status === "Rejected" ? (
                      <XCircle className="w-5 h-5" />
                    ) : (
                      <Clock className="w-5 h-5" />
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">
                        {leave.leaveType} Leave
                      </h3>
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
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Destination: <b className="text-slate-700">{leave.destination}</b> • Parent: {leave.parentContact}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs font-semibold text-slate-800">
                    {formatDate(leave.startDate)} &rarr; {formatDate(leave.endDate)}
                  </p>
                  <p className="text-[10px] text-slate-400 mt-0.5">
                    Applied on {formatDate(leave.createdAt)}
                  </p>
                </div>
              </div>

              <div className="mt-3.5 pt-3 border-t border-slate-100 text-xs">
                <p className="text-slate-600">
                  <span className="font-semibold text-slate-700">Reason:</span> {leave.reason}
                </p>
                {leave.remarks && (
                  <p className="mt-1 text-slate-600 bg-slate-50 p-2 rounded-lg border border-slate-100">
                    <span className="font-semibold text-slate-800">Warden Remarks:</span>{" "}
                    {leave.remarks}
                  </p>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
