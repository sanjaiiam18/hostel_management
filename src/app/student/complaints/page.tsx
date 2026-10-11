"use client";

import React, { useState, useEffect } from "react";
import {
  AlertCircle,
  Plus,
  CheckCircle2,
  Clock,
  ShieldAlert,
  ArrowUpCircle,
  Wrench,
  Zap,
  Droplet,
  Wifi,
  Sparkles,
  PhoneCall,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function StudentComplaintsPage() {
  const { success, error: toastError } = useToast();

  const [complaints, setComplaints] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    category: "Electrical",
    subject: "",
    description: "",
    priority: "Medium",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchComplaints = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/complaints");
      if (res.ok) {
        const data = await res.json();
        setComplaints(data.complaints || []);
      }
    } catch (e) {
      console.error(e);
      toastError("Failed to fetch tickets", "Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.subject.trim() || !formData.description.trim()) {
      toastError("Missing Fields", "Please specify subject and description.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/complaints", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit complaint");

      success("Complaint Logged!", "Ticket registered and dispatched to hostel maintenance.");
      setIsModalOpen(false);
      setFormData({
        category: "Electrical",
        subject: "",
        description: "",
        priority: "Medium",
      });
      fetchComplaints();
    } catch (err: any) {
      toastError("Submission Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredComplaints = complaints.filter((c) => {
    if (selectedCategory === "ALL") return true;
    return c.category === selectedCategory;
  });

  const categories = ["ALL", "Electrical", "Plumbing", "Wi-Fi", "Cleanliness", "Carpentry"];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Maintenance Tickets & Room Complaints
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Dispatch urgent requests for electrical, plumbing, Wi-Fi, carpentry, or cleanliness repairs
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchComplaints}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="gap-1.5 h-8 text-xs font-bold shrink-0"
          >
            <Plus className="w-4 h-4" /> Report Issue
          </Button>
        </div>
      </div>

      {/* Emergency Hotline Header */}
      <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0">
            <Zap className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold text-amber-950">
              Immediate Hazard or Major Water Leakage?
            </p>
            <p className="text-[11px] text-amber-800">
              For emergency power sparks or flooding, call the 24/7 Hostel Electrician Line directly.
            </p>
          </div>
        </div>
        <a
          href="tel:+919876500003"
          className="text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-3.5 py-1.5 rounded-xl transition self-start sm:self-auto shrink-0"
        >
          Call Electrician Desk
        </a>
      </div>

      {/* Category Filter Chips */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-fit">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setSelectedCategory(cat)}
            className={`px-3 py-1 rounded-lg transition-all ${
              selectedCategory === cat
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {cat === "ALL" ? `All (${complaints.length})` : cat}
          </button>
        ))}
      </div>

      {/* Complaints List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      ) : filteredComplaints.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No open complaints</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            Your room and facilities are running smoothly. Click &quot;Report Issue&quot; if you need maintenance assistance.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredComplaints.map((c) => {
            const isResolved = c.status === "Resolved";
            const isInProgress = c.status === "In Progress";
            return (
              <Card
                key={c._id}
                className={`p-5 transition hover:shadow-md ${
                  isResolved
                    ? "border-emerald-200/80 bg-slate-50/40"
                    : isInProgress
                    ? "border-brand-300 bg-brand-50/10"
                    : "border-slate-200/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-100 text-slate-700 uppercase tracking-wider">
                        {c.category}
                      </span>
                      <span className="text-sm font-black text-slate-900">
                        {c.subject}
                      </span>
                      <Badge
                        variant={
                          isResolved
                            ? "success"
                            : isInProgress
                            ? "info"
                            : c.priority === "Emergency"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {c.status}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{c._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <p className="text-xs text-slate-700 leading-relaxed">
                      {c.description}
                    </p>

                    <div className="flex flex-wrap items-center gap-4 text-[11px] text-slate-400 pt-1">
                      <span>Logged: {formatDate(c.createdAt)}</span>
                      {c.assignedTo && (
                        <span className="text-brand-700 font-semibold">
                          Assigned to: {c.assignedTo}
                        </span>
                      )}
                      {c.resolvedAt && (
                        <span className="text-emerald-700 font-semibold">
                          Resolved: {formatDate(c.resolvedAt)}
                        </span>
                      )}
                    </div>

                    {c.resolutionNotes && (
                      <div className="p-2.5 rounded-lg bg-emerald-50/70 border border-emerald-200 text-xs text-emerald-900">
                        <b>Technician Notes:</b> {c.resolutionNotes}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    <span className="text-xs font-bold px-2.5 py-1 rounded-lg bg-slate-100 text-slate-600">
                      Priority: {c.priority}
                    </span>
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* REPORT ISSUE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Report Room / Hostel Maintenance Issue"
        description="Tickets are routed directly to the hostel electrician & plumber repair schedule."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Issue Category</label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="Electrical">Electrical (Fan / Socket / Light)</option>
                <option value="Plumbing">Plumbing (Tap / Drain / Geyser)</option>
                <option value="Carpentry">Carpentry (Bed / Desk / Wardrobe)</option>
                <option value="Wi-Fi">Wi-Fi & Internet Port</option>
                <option value="Cleanliness">Room & Washroom Hygiene</option>
                <option value="Security">Locks & Keys</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Priority Level</label>
              <select
                value={formData.priority}
                onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="Low">Low (Can wait 2-3 days)</option>
                <option value="Medium">Medium (Within 24 hours)</option>
                <option value="High">High (Impacting studies)</option>
                <option value="Emergency">Emergency (Sparks / Leakage)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Brief Subject</label>
            <Input
              value={formData.subject}
              onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
              placeholder="e.g. Ceiling fan making loud clicking sound at speed 3"
              required
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Detailed Description</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Specify the exact location in room (Bed A/B, switchboard #, etc)..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Submit Ticket
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
