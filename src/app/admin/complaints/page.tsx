"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, CheckCircle2, Clock, ShieldAlert, ArrowUpCircle, UserCheck } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function AdminComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [filterCategory, setFilterCategory] = useState("ALL");
  const [filterPriority, setFilterPriority] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  // Update Modal State
  const [selectedComplaint, setSelectedComplaint] = useState<any>(null);
  const [newStatus, setNewStatus] = useState("In Progress");
  const [assignedTo, setAssignedTo] = useState("");
  const [resolutionNotes, setResolutionNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams();
      if (filterCategory !== "ALL") params.append("category", filterCategory);
      if (filterPriority !== "ALL") params.append("priority", filterPriority);

      const res = await fetch(`/api/complaints?${params.toString()}`);
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [filterCategory, filterPriority]);

  const openUpdateModal = (c: any) => {
    setSelectedComplaint(c);
    setNewStatus(c.status);
    setAssignedTo(c.assignedTo || "Maintenance Electrician / Plumber");
    setResolutionNotes(c.resolutionNotes || "");
    setIsModalOpen(true);
  };

  const handleUpdateSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedComplaint) return;

    setIsSubmitting(true);
    try {
      const res = await fetch(`/api/complaints/${selectedComplaint._id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          status: newStatus,
          assignedTo,
          resolutionNotes,
        }),
      });

      if (res.ok) {
        setIsModalOpen(false);
        fetchComplaints();
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
          <h1 className="text-2xl font-bold text-navy-950">Maintenance & Complaints Queue</h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch maintenance technicians, update resolution progress, and close tickets
          </p>
        </div>

        {/* Filter Bar */}
        <div className="flex gap-2">
          <select
            value={filterCategory}
            onChange={(e) => setFilterCategory(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">All Categories</option>
            <option value="Electrical">Electrical</option>
            <option value="Plumbing">Plumbing</option>
            <option value="Food">Food / Mess</option>
            <option value="Wi-Fi">Wi-Fi</option>
            <option value="Security">Security</option>
            <option value="Room">Room</option>
          </select>

          <select
            value={filterPriority}
            onChange={(e) => setFilterPriority(e.target.value)}
            className="text-xs rounded-lg border border-slate-300 bg-white px-2.5 py-1.5 font-medium"
          >
            <option value="ALL">All Priorities</option>
            <option value="Urgent">Urgent Priority</option>
            <option value="High">High Priority</option>
            <option value="Medium">Medium Priority</option>
            <option value="Low">Low Priority</option>
          </select>
        </div>
      </div>

      {/* Ticket Status Update Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Update Maintenance Ticket"
        description={`Ticket #${selectedComplaint?._id?.slice(-6)} filed by ${selectedComplaint?.studentId?.name}`}
      >
        <form onSubmit={handleUpdateSubmit} className="space-y-4">
          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
            <p className="font-bold text-slate-900">{selectedComplaint?.subject}</p>
            <p className="text-slate-600">Category: {selectedComplaint?.category}</p>
            <p className="text-slate-500 italic">"{selectedComplaint?.description}"</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Update Ticket Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
            >
              <option value="Submitted">Submitted (Queued)</option>
              <option value="Under Review">Under Review</option>
              <option value="In Progress">In Progress (Work Assigned)</option>
              <option value="Resolved">Resolved (Completed)</option>
              <option value="Rejected">Rejected</option>
            </select>
          </div>

          <Input
            label="Assigned Technician / Staff Member"
            value={assignedTo}
            onChange={(e) => setAssignedTo(e.target.value)}
            placeholder="e.g. Electrician Ramesh (Ext 401)"
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Resolution Remarks / Notes for Student
            </label>
            <textarea
              rows={3}
              value={resolutionNotes}
              onChange={(e) => setResolutionNotes(e.target.value)}
              placeholder="e.g. Replaced MCB switch and verified socket power..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
              Save Ticket Update
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complaints List */}
      <div className="space-y-3">
        {complaints.length === 0 ? (
          <Card className="p-12 text-center text-slate-400 text-xs">
            No complaints found for the selected filters.
          </Card>
        ) : (
          complaints.map((c) => {
            const isUrgent = c.priority === "Urgent";
            return (
              <Card
                key={c._id}
                className={`p-5 transition-colors ${
                  isUrgent && c.status !== "Resolved"
                    ? "border-rose-300 bg-rose-50/20"
                    : "hover:border-slate-300"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                        {c.category}
                      </span>
                      <h3 className="text-sm font-bold text-slate-900">{c.subject}</h3>
                      {isUrgent && <Badge variant="danger">Urgent</Badge>}
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Student: <b>{c.studentId?.name || "Student"}</b> ({c.studentId?.studentId}) • Contact: {c.studentId?.phone}
                    </p>
                  </div>

                  <div className="flex items-center gap-3">
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
                    <Button onClick={() => openUpdateModal(c)} size="sm" variant="outline">
                      Update
                    </Button>
                  </div>
                </div>

                <div className="mt-3 pt-3 border-t border-slate-100 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-slate-600">
                  <p className="flex-1">{c.description}</p>
                  <div className="text-right shrink-0 text-slate-400 text-[11px]">
                    Assigned: <b>{c.assignedTo || "Unassigned"}</b> • Filed {formatDate(c.createdAt)}
                  </div>
                </div>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
