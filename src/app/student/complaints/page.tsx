"use client";

import React, { useState, useEffect } from "react";
import { AlertCircle, Plus, CheckCircle2, Clock, ShieldAlert, ArrowUpCircle } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { formatDate } from "@/lib/utils";

export default function StudentComplaintsPage() {
  const [complaints, setComplaints] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: "Electrical",
    subject: "",
    description: "",
    priority: "Medium",
    attachmentUrl: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchComplaints = async () => {
    try {
      const res = await fetch("/api/complaints");
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit complaint");

      setIsModalOpen(false);
      setFormData({
        category: "Electrical",
        subject: "",
        description: "",
        priority: "Medium",
        attachmentUrl: "",
      });
      fetchComplaints();
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
          <h1 className="text-2xl font-bold text-navy-950">Maintenance & Complaints</h1>
          <p className="text-xs text-slate-500 mt-1">
            Report hostel room issues, Wi-Fi, electricity, plumbing, food, or security concerns
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Report an Issue
        </Button>
      </div>

      {/* Complaint Application Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="File a Hostel Complaint"
        description="Provide details so the maintenance team can resolve the issue promptly"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Electrical">Electrical</option>
                <option value="Plumbing">Plumbing</option>
                <option value="Food">Food / Mess</option>
                <option value="Room">Room Furniture</option>
                <option value="Cleaning">Cleaning & Hygiene</option>
                <option value="Wi-Fi">Wi-Fi & Internet</option>
                <option value="Security">Security & Safety</option>
                <option value="Other">Other</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Urgency Priority
              </label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Low">Low - Minor inconvenience</option>
                <option value="Medium">Medium - Regular repair</option>
                <option value="High">High - Significant disruption</option>
                <option value="Urgent">Urgent - Emergency / Safety Hazard</option>
              </select>
            </div>
          </div>

          <Input
            label="Subject / Short Summary"
            placeholder="e.g. Geyser not heating in Room 204"
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            required
          />

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Issue Description
            </label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Explain the issue in detail, exact location in room, since when..."
              className="w-full rounded-lg border border-slate-300 p-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
              required
            />
          </div>

          <Input
            label="Optional Photo / Proof URL"
            placeholder="https://... (Optional)"
            value={formData.attachmentUrl}
            onChange={(e) => setFormData({ ...formData, attachmentUrl: e.target.value })}
          />

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Complaint
            </Button>
          </div>
        </form>
      </Modal>

      {/* Complaints List */}
      <div className="space-y-4">
        {complaints.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <AlertCircle className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No complaints reported</p>
            <p className="text-xs text-slate-400 mt-1">
              Everything in your room seems to be in good order!
            </p>
          </Card>
        ) : (
          complaints.map((c) => (
            <Card
              key={c._id}
              className={`p-5 transition-colors ${
                c.priority === "Urgent" && c.status !== "Resolved"
                  ? "border-rose-300 bg-rose-50/20 shadow-sm"
                  : "hover:border-slate-300"
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-semibold px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {c.category}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900">{c.subject}</h3>
                    {c.priority === "Urgent" && (
                      <Badge variant="danger" className="animate-pulse">
                        Urgent
                      </Badge>
                    )}
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    Filed on {formatDate(c.createdAt)} • Assigned to:{" "}
                    <b>{c.assignedTo || "Warden Dispatch"}</b>
                  </p>
                </div>

                <Badge
                  variant={
                    c.status === "Resolved"
                      ? "success"
                      : c.status === "In Progress"
                      ? "info"
                      : c.status === "Under Review"
                      ? "warning"
                      : "secondary"
                  }
                >
                  {c.status}
                </Badge>
              </div>

              <div className="mt-3 pt-3 border-t border-slate-100 text-xs space-y-2">
                <p className="text-slate-600">{c.description}</p>
                {c.resolutionNotes && (
                  <div className="p-2.5 rounded-lg bg-emerald-50 border border-emerald-100 text-emerald-800">
                    <span className="font-bold">Resolution Note:</span> {c.resolutionNotes}
                    {c.resolvedAt && (
                      <span className="block text-[10px] text-emerald-600 mt-0.5">
                        Resolved on {formatDate(c.resolvedAt)}
                      </span>
                    )}
                  </div>
                )}
              </div>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
