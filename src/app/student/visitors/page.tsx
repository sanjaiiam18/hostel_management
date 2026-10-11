"use client";

import React, { useState, useEffect } from "react";
import {
  Users2,
  Plus,
  Clock,
  CheckCircle2,
  XCircle,
  LogIn,
  LogOut,
  Phone,
  QrCode,
  ShieldCheck,
  RefreshCw,
  Printer,
  Copy,
  Check,
  UserCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function StudentVisitorsPage() {
  const { success, error: toastError } = useToast();

  const [visitors, setVisitors] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState<"ALL" | "Approved" | "Pending">("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedPass, setSelectedPass] = useState<any>(null);

  // Form state
  const [formData, setFormData] = useState({
    visitorName: "",
    relationship: "Parent",
    phoneNumber: "",
    visitDate: new Date().toISOString().split("T")[0],
    expectedEntryTime: "10:00 AM",
    expectedExitTime: "04:00 PM",
    purpose: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchVisitors = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/visitors");
      if (res.ok) {
        const data = await res.json();
        setVisitors(data.visitors || []);
      }
    } catch (e) {
      console.error(e);
      toastError("Failed to fetch visitors", "Please check your network connection.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchVisitors();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.visitorName.trim() || !formData.phoneNumber.trim() || !formData.purpose.trim()) {
      toastError("Missing Fields", "Please complete visitor name, phone number, and purpose.");
      return;
    }

    setIsSubmitting(true);
    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register visitor");

      success("Visitor Registered!", "Pass request routed to Warden and Main Security Gate.");
      setIsModalOpen(false);
      setFormData({
        visitorName: "",
        relationship: "Parent",
        phoneNumber: "",
        visitDate: new Date().toISOString().split("T")[0],
        expectedEntryTime: "10:00 AM",
        expectedExitTime: "04:00 PM",
        purpose: "",
      });
      fetchVisitors();
    } catch (err: any) {
      toastError("Registration Failed", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const filteredVisitors = visitors.filter((v) => {
    if (filterStatus === "ALL") return true;
    return v.status === filterStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Campus Visitor Passes & Security Logs
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-register visiting parents and relatives for swift entry clearance at the campus main gate
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={fetchVisitors}
            className="h-8 text-xs gap-1.5"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          <Button
            onClick={() => setIsModalOpen(true)}
            size="sm"
            className="gap-1.5 h-8 text-xs font-bold shrink-0"
          >
            <Plus className="w-4 h-4" /> Register Visitor
          </Button>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-fit">
        {(["ALL", "Approved", "Pending"] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setFilterStatus(tab)}
            className={`px-3 py-1 rounded-lg transition-all ${
              filterStatus === tab
                ? "bg-white text-slate-900 shadow-xs font-bold"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {tab === "ALL" ? `All (${visitors.length})` : `${tab} (${visitors.filter(v => v.status === tab).length})`}
          </button>
        ))}
      </div>

      {/* Visitors List */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton lines={4} />
          <CardSkeleton lines={4} />
        </div>
      ) : filteredVisitors.length === 0 ? (
        <div className="p-12 text-center rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
          <UserCheck className="w-10 h-10 text-slate-300 mx-auto" />
          <p className="text-sm font-bold text-slate-800">No visitor records found</p>
          <p className="text-xs text-slate-400 max-w-sm mx-auto">
            You have no visitor registrations under this filter. Click &quot;Register Visitor&quot; to issue a pass.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredVisitors.map((v) => {
            const isApproved = v.status === "Approved";
            const isPending = v.status === "Pending";
            return (
              <Card
                key={v._id}
                className={`p-5 transition hover:shadow-md ${
                  isApproved
                    ? "border-cyan-300/80 bg-gradient-to-r from-cyan-50/20 via-white to-white"
                    : "border-slate-200/80"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                  <div className="space-y-2 flex-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-black text-slate-900">
                        {v.visitorName}
                      </span>
                      <span className="text-xs font-semibold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                        {v.relationship}
                      </span>
                      <Badge
                        variant={
                          isApproved ? "success" : isPending ? "warning" : "secondary"
                        }
                      >
                        {v.status}
                      </Badge>
                      <span className="text-[10px] font-mono text-slate-400">
                        #{v._id.slice(-6).toUpperCase()}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1 text-xs text-slate-600">
                      <p>
                        Scheduled Date: <b>{formatDate(v.visitDate)}</b> &bull; Time: <b>{v.expectedEntryTime} - {v.expectedExitTime}</b>
                      </p>
                      <p className="flex items-center gap-1 text-slate-700">
                        <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        Phone: <b>{v.phoneNumber}</b>
                      </p>
                    </div>

                    <p className="text-xs text-slate-700 bg-slate-50/80 p-2.5 rounded-lg border border-slate-100">
                      Purpose: <b>{v.purpose}</b>
                    </p>

                    {(v.checkInTime || v.checkOutTime) && (
                      <div className="flex gap-4 text-[11px] text-slate-500 pt-1">
                        {v.checkInTime && (
                          <span className="text-emerald-700 font-semibold flex items-center gap-1">
                            <LogIn className="w-3 h-3" /> Gate Checked-in: {new Date(v.checkInTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                        {v.checkOutTime && (
                          <span className="text-slate-600 font-semibold flex items-center gap-1">
                            <LogOut className="w-3 h-3" /> Exited: {new Date(v.checkOutTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 self-end sm:self-center">
                    {isApproved ? (
                      <Button
                        size="sm"
                        variant="primary"
                        onClick={() => setSelectedPass(v)}
                        className="gap-1.5 font-bold shadow-xs"
                      >
                        <QrCode className="w-3.5 h-3.5" /> View Security Slip
                      </Button>
                    ) : (
                      <span className="text-xs text-amber-700 font-semibold bg-amber-50 px-3 py-1.5 rounded-lg border border-amber-200/80 inline-flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5" /> Awaiting Security Gate Clearance
                      </span>
                    )}
                  </div>
                </div>
              </Card>
            );
          })}
        </div>
      )}

      {/* SECURITY GATE SLIP MODAL */}
      {selectedPass && (
        <Modal
          isOpen={!!selectedPass}
          onClose={() => setSelectedPass(null)}
          title="Campus Security Visitor Pass Slip"
          description="Present to the Gate Security Guard for turnstile clearance."
        >
          <div className="space-y-4">
            <div className="p-5 rounded-2xl bg-gradient-to-b from-slate-50 to-white border-2 border-cyan-500/50 shadow-inner space-y-3">
              <div className="text-center pb-3 border-b border-dashed border-slate-300">
                <p className="text-[10px] font-black uppercase tracking-widest text-cyan-900">
                  National Institute of Technology &bull; Main Gate Security
                </p>
                <h3 className="text-base font-black text-slate-900 mt-0.5">
                  AUTHORIZED VISITOR GATE PASS
                </h3>
                <p className="text-[10px] text-slate-500 font-mono">
                  Pass #{selectedPass._id.slice(-6).toUpperCase()} &bull; Security Validated
                </p>
              </div>

              <div className="space-y-2 text-xs text-slate-700">
                <div className="flex justify-between">
                  <span className="text-slate-500">Visitor:</span>
                  <span className="font-bold text-slate-900">{selectedPass.visitorName} ({selectedPass.relationship})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Host Student:</span>
                  <span className="font-bold text-slate-900">{selectedPass.studentId?.name || "Aarav Mehta"}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Date & Window:</span>
                  <span className="font-semibold text-slate-800">{formatDate(selectedPass.visitDate)} ({selectedPass.expectedEntryTime} - {selectedPass.expectedExitTime})</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Purpose:</span>
                  <span className="text-slate-800 font-medium">{selectedPass.purpose}</span>
                </div>
              </div>

              <div className="pt-3 border-t border-dashed border-slate-300 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <ShieldCheck className="w-5 h-5 text-emerald-600" />
                  <span className="text-[11px] font-bold text-emerald-900">Security Clearance Granted</span>
                </div>
                <QrCode className="w-10 h-10 text-slate-900" />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <Button size="sm" variant="outline" onClick={() => window.print()} className="gap-1.5 text-xs font-semibold">
                <Printer className="w-3.5 h-3.5" /> Print
              </Button>
              <Button size="sm" variant="primary" onClick={() => setSelectedPass(null)} className="text-xs">
                Done
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* REGISTER VISITOR MODAL */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Expected Campus Visitor"
        description="Submit visitor details for automatic security desk authorization."
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Visitor Full Name</label>
              <Input
                value={formData.visitorName}
                onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
                placeholder="e.g. Ramesh Mehta"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Relationship</label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
              >
                <option value="Parent">Parent (Mother / Father)</option>
                <option value="Guardian">Local Guardian</option>
                <option value="Sibling">Sibling (Brother / Sister)</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend / Academic Peer</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Contact Phone</label>
              <Input
                value={formData.phoneNumber}
                onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                placeholder="+91 98765 43210"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Date of Visit</label>
              <Input
                type="date"
                value={formData.visitDate}
                onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Entry Time</label>
              <Input
                value={formData.expectedEntryTime}
                onChange={(e) => setFormData({ ...formData, expectedEntryTime: e.target.value })}
                placeholder="10:00 AM"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">Expected Exit Time</label>
              <Input
                value={formData.expectedExitTime}
                onChange={(e) => setFormData({ ...formData, expectedExitTime: e.target.value })}
                placeholder="04:00 PM"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">Purpose of Visit</label>
            <textarea
              rows={2}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="e.g. Delivering winter clothes and family visit..."
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
              Register & Request Clearance
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
