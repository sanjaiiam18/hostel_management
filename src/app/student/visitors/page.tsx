"use client";

import React, { useState, useEffect } from "react";
import { Users2, Plus, Clock, CheckCircle2, XCircle, LogIn, LogOut, Phone } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function StudentVisitorsPage() {
  const [visitors, setVisitors] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);

  // Form state
  const [formData, setFormData] = useState({
    visitorName: "",
    relationship: "Parent",
    phoneNumber: "",
    visitDate: "",
    expectedEntryTime: "10:00 AM",
    expectedExitTime: "04:00 PM",
    purpose: "",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const fetchVisitors = async () => {
    try {
      const res = await fetch("/api/visitors");
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
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFormError("");

    try {
      const res = await fetch("/api/visitors", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to register visitor");

      setIsModalOpen(false);
      setFormData({
        visitorName: "",
        relationship: "Parent",
        phoneNumber: "",
        visitDate: "",
        expectedEntryTime: "10:00 AM",
        expectedExitTime: "04:00 PM",
        purpose: "",
      });
      fetchVisitors();
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
          <h1 className="text-2xl font-bold text-navy-950">Visitor Passes</h1>
          <p className="text-xs text-slate-500 mt-1">
            Pre-register family or guardian visits and track security gate clearance
          </p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
          <Plus className="w-4 h-4" /> Register Visitor
        </Button>
      </div>

      {/* Visitor Registration Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Register Expected Visitor"
        description="Submit visitor details for warden security pre-approval"
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          {formError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {formError}
            </div>
          )}

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Visitor Full Name"
              placeholder="e.g. Robert Smith"
              value={formData.visitorName}
              onChange={(e) => setFormData({ ...formData, visitorName: e.target.value })}
              required
            />
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1.5">
                Relationship
              </label>
              <select
                value={formData.relationship}
                onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
                className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
              >
                <option value="Parent">Parent (Father / Mother)</option>
                <option value="Guardian">Local Guardian</option>
                <option value="Sibling">Sibling</option>
                <option value="Relative">Relative</option>
                <option value="Friend">Friend / Colleague</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Phone Number"
              placeholder="+91 9876543210"
              value={formData.phoneNumber}
              onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
              required
            />
            <Input
              label="Visit Date"
              type="date"
              value={formData.visitDate}
              onChange={(e) => setFormData({ ...formData, visitDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Expected Entry Time"
              placeholder="e.g. 10:00 AM"
              value={formData.expectedEntryTime}
              onChange={(e) => setFormData({ ...formData, expectedEntryTime: e.target.value })}
              required
            />
            <Input
              label="Expected Exit Time"
              placeholder="e.g. 04:00 PM"
              value={formData.expectedExitTime}
              onChange={(e) => setFormData({ ...formData, expectedExitTime: e.target.value })}
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Purpose of Visit
            </label>
            <textarea
              rows={2}
              value={formData.purpose}
              onChange={(e) => setFormData({ ...formData, purpose: e.target.value })}
              placeholder="Reason for campus visit..."
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
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
              Submit Visitor Request
            </Button>
          </div>
        </form>
      </Modal>

      {/* Visitors List */}
      <div className="space-y-4">
        {visitors.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Users2 className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No visitor records</p>
            <p className="text-xs text-slate-400 mt-1">
              Need someone to visit you in the hostel lobby? Register a pass above.
            </p>
          </Card>
        ) : (
          visitors.map((v) => (
            <Card key={v._id} className="p-5 hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div
                    className={`p-2.5 rounded-xl ${
                      v.status === "Checked In"
                        ? "bg-emerald-50 text-emerald-600"
                        : v.status === "Approved"
                        ? "bg-blue-50 text-blue-600"
                        : v.status === "Pending"
                        ? "bg-amber-50 text-amber-600"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    <Users2 className="w-5 h-5" />
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="text-sm font-bold text-slate-900">{v.visitorName}</h3>
                      <span className="text-xs text-slate-500">({v.relationship})</span>
                      <Badge
                        variant={
                          v.status === "Checked In"
                            ? "success"
                            : v.status === "Approved"
                            ? "info"
                            : v.status === "Rejected"
                            ? "danger"
                            : v.status === "Checked Out"
                            ? "secondary"
                            : "warning"
                        }
                      >
                        {v.status}
                      </Badge>
                    </div>
                    <p className="text-xs text-slate-500 mt-0.5">
                      Phone: {v.phoneNumber} • Purpose: {v.purpose}
                    </p>
                  </div>
                </div>

                <div className="text-left sm:text-right">
                  <p className="text-xs font-bold text-slate-800">
                    Visit Date: {formatDate(v.visitDate)}
                  </p>
                  <p className="text-xs text-slate-500">
                    Expected: {v.expectedEntryTime} – {v.expectedExitTime}
                  </p>
                </div>
              </div>

              {(v.actualEntryTime || v.actualExitTime) && (
                <div className="mt-3 pt-3 border-t border-slate-100 flex items-center gap-6 text-xs text-slate-600">
                  {v.actualEntryTime && (
                    <span className="flex items-center gap-1 text-emerald-700">
                      <LogIn className="w-3.5 h-3.5" /> Checked In: {v.actualEntryTime}
                    </span>
                  )}
                  {v.actualExitTime && (
                    <span className="flex items-center gap-1 text-slate-500">
                      <LogOut className="w-3.5 h-3.5" /> Checked Out: {v.actualExitTime}
                    </span>
                  )}
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
