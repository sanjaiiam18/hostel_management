"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import {
  CalendarClock,
  Plus,
  CheckCircle2,
  XCircle,
  Clock,
  AlertCircle,
  QrCode,
  Printer,
  Copy,
  Check,
  ShieldCheck,
  MapPin,
  ExternalLink,
  RefreshCw,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { useToast } from "@/components/ui/toast";
import { CardSkeleton } from "@/components/ui/skeleton";
import { formatDate } from "@/lib/utils";

export default function StudentLeavesPage() {
  const { success, error: toastError } = useToast();

  const [leaves, setLeaves] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "Approved" | "Pending" | "Rejected">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<any>(null);
  const [copiedPassId, setCopiedPassId] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    leaveType: "Home Leave",
    startDate: new Date().toISOString().split("T")[0],
    endDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
    reason: "",
    destination: "",
    parentConsentVerified: true,
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchLeaves = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/leaves");
      if (res.ok) {
        const data = await res.json();
        setLeaves(data.leaves || []);
      }
    } catch (e) {
      console.error(e);
      toastError("Failed to fetch leaves", "Please check server connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.reason.trim() || !formData.destination.trim()) {
      toastError("Missing Fields", "Please specify reason and destination.");
      return;
    }

    if (new Date(formData.endDate) < new Date(formData.startDate)) {
      toastError("Invalid Dates", "Return date must be on or after departure date.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/leaves", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit leave request");

      success("Outpass Submitted!", "Your request has been routed to the Warden Desk.");
      setIsModalOpen(false);
      setFormData({
        leaveType: "Home Leave",
        startDate: new Date().toISOString().split("T")[0],
        endDate: new Date(Date.now() + 86400000 * 2).toISOString().split("T")[0],
        reason: "",
        destination: "",
        parentConsentVerified: true,
      });
      fetchLeaves();
    } catch (err: any) {
      toastError("Submission Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCopyPassId = (id: string) => {
    navigator.clipboard.writeText(id);
    setCopiedPassId(true);
    success("Copied", `Gate Pass ID ${id} copied to clipboard.`);
    setTimeout(() => setCopiedPassId(false), 2000);
  };

  const filteredLeaves = leaves.filter((l) => {
    if (filterStatus === "ALL") return true;
    return l.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Leave Requests & Digital Outpasses
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Apply for weekend/home outpasses and present digital gate QR slips to campus security
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchLeaves}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="gap-1.5 h-8 text-xs font-bold shrink-0"
          >
            <Plus className="w-4 h-4" /> Apply for Leave
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-fit">
        {(["ALL", "Approved", "Pending", "Rejected"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterStatus === tab
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "ALL" ? `All (${leaves.length})` : `${tab} (${leaves.filter(l => l.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Leaves List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      ) : filteredLeaves.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <CalendarClock className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-700">No leave requests found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You currently have no leave requests matching this filter. Click &quot;Apply for Leave&quot; above to submit an outpass.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredLeaves.map((leave) => {
            const isApproved = leave.status === "Approved";
            const isPending = leave.status === "Pending";
            return (
              <Card
                key={leave._id}
                className={`p-5 transition hover:shadow-md ${
                  isApproved
                    ? "border-emerald-300/80 bg-gradient-to-r from-emerald-50/20 via-white to-white"
                    : isPending
                    ? "border-amber-300/80"
                    : "border-slate-200"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {leave.leaveType} Outpass
                      </span>
                      <Badge
                        variant={
                          isApproved ? "success" : isPending ? "warning" : "danger"
                        }
                      >
                        {leave.status}
                      </Badge>
                      <span className="text-[11px] font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded">
                        #{leave._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                      <p>
                        Departure: <b>{formatDate(leave.startDate)}</b> &bull; Return: <b>{formatDate(leave.endDate)}</b>
                      </p>
                      <p className="flex items-center gap-1 text-slate-700">
                        <MapPin className="w-3.5 h-3.5 text-brand-600 shrink-0" />
                        Destination: <b>{leave.destination}</b>
                      </p>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100 italic">
                      &quot;{leave.reason}&quot;
                    </p>

                    {leave.remarks && (
                      <p className="text-[11px] text-slate-500">
                        Warden Remarks: <span className="font-medium text-slate-700">{leave.remarks}</span>
                      </p>
                    )}
                  </div>

                  {/* Action buttons */}
                  <div className="shrink-0 self-end sm:self-center">
                    {isApproved ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setSelectedPass(leave)}
                        className="gap-1.5 font-bold shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" /> View Gate Slip
                      </Button>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Under Warden Review
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* DIGITAL GATE PASS MODAL (Realistic Institutional Outpass Slip) */}
      {selectedPass && (
        <Modal
          isOpen={!!selectedPass}
          onClose={() => setSelectedPass(null)}
          title="Digital Gate Outpass Clearance Slip"
          description="Present this official verifiable pass to the security guard at the campus gate."
        >
          <div className="space-y-4">
            {/* The Pass Paper / Card Container */}
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border-2 border-emerald-500/50 shadow-inner relative overflow-hidden">
              {/* Institutional Header Stamp */}
              <div className="text-center pb-4 border-b border-dashed border-slate-300 space-y-1">
                <div className="flex items-center justify-center gap-2 mb-1">
                  <div className="h-7 w-7 rounded-lg bg-white p-0.5 shadow-xs border border-slate-200 flex items-center justify-center">
                    <Image
                      src="/logo.png"
                      alt="BIT Logo"
                      width={24}
                      height={20}
                      className="object-contain"
                    />
                  </div>
                  <span className="text-[11px] font-black uppercase tracking-widest text-emerald-800">
                    Bannari Amman Institute of Technology &bull; Security Directorate
                  </span>
                </div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  OFFICIAL HOSTEL GATE EXIT CLEARANCE
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Pass Ref: #OP-{selectedPass._id.slice(-6).toUpperCase()} &bull; Validated Online
                </p>
              </div>

              {/* Pass Details Grid */}
              <div className="py-4 space-y-2.5 text-xs text-slate-700">
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Student Name</span>
                    <p className="font-bold text-slate-900">{selectedPass.studentId?.name || "Resident Student"}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Student ID</span>
                    <p className="font-mono font-bold text-slate-900">{selectedPass.studentId?.studentId || "STU-2026-001"}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Exit Date</span>
                    <p className="font-bold text-slate-900">{formatDate(selectedPass.startDate)}</p>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 uppercase font-semibold">Return Deadline</span>
                    <p className="font-bold text-slate-900">{formatDate(selectedPass.endDate)} (09:30 PM)</p>
                  </div>
                </div>

                <div className="pt-1">
                  <span className="text-[10px] text-slate-400 uppercase font-semibold">Destination & Purpose</span>
                  <p className="font-medium text-slate-800">{selectedPass.destination} &bull; {selectedPass.reason}</p>
                </div>
              </div>

              {/* Verified Warden Stamp & QR Section */}
              <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                    <ShieldCheck className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[11px] font-black text-emerald-900 uppercase">Warden Authorized</p>
                    <p className="text-[10px] text-emerald-700">Dr. Rajesh Sharma &bull; Biometrics Verified</p>
                  </div>
                </div>

                {/* Simulated QR Code Icon */}
                <div className="h-12 w-12 bg-slate-900 text-white rounded-xl flex items-center justify-center font-mono text-[9px] text-center p-1 font-bold">
                  <QrCode className="w-8 h-8 text-white" />
                </div>
              </div>
            </div>

            {/* Modal action buttons */}
            <div className="flex justify-between items-center pt-2">
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopyPassId(`OP-${selectedPass._id.slice(-6).toUpperCase()}`)}
                className="gap-1.5 text-xs"
              >
                {copiedPassId ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                Copy Pass Code
              </Button>

              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => window.print()}
                  className="gap-1.5 text-xs font-semibold"
                >
                  <Printer className="w-3.5 h-3.5" /> Print Slip
                </Button>
                <Button
                  size="sm"
                  variant="primary"
                  onClick={() => setSelectedPass(null)}
                  className="text-xs"
                >
                  Done
                </Button>
              </div>
            </div>
          </div>
        </Modal>
      )}

      {/* APPLY FOR LEAVE MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Hostel Outpass & Leave Application"
        description="Submit your leave application for automated routing to the Warden Desk."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Leave Category</label>
              <select
                value={formData.leaveType}
                onChange={(e) => setFormData({ ...formData, leaveType: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="Home Leave">Home Leave (Weekend/Break)</option>
                <option value="Outpass">Day Outpass (City Visit)</option>
                <option value="Medical">Medical / Emergency</option>
                <option value="Academic Duty">Academic / Sports Meet</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Destination</label>
              <Input
                value={formData.destination}
                onChange={(e) => setFormData({ ...formData, destination: e.target.value })}
                placeholder="e.g. Home (Mumbai) / Phoenix Mall"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Start Date</label>
              <Input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">End Date</label>
              <Input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose / Justification</label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="Provide a clear description of the reason for absence..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
              required
            />
          </div>

          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-slate-50 border border-slate-200">
            <input
              type="checkbox"
              id="parentVerifiedCheck"
              checked={formData.parentConsentVerified}
              onChange={(e) => setFormData({ ...formData, parentConsentVerified: e.target.checked })}
              className="rounded text-brand-600 focus:ring-brand-500"
            />
            <label htmlFor="parentVerifiedCheck" className="text-xs text-slate-700 cursor-pointer">
              I certify that my registered guardian has been informed and given approval.
            </label>
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
              Submit Application
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
