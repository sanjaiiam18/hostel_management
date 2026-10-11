"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, Plus, CheckCircle2, Clock, Receipt, Filter } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function AdminFeesPage() {
  const [fees, setFees] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [filterStatus, setFilterStatus] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [message, setMessage] = useState("");

  // Create Fee Record Form
  const [formData, setFormData] = useState({
    studentId: "",
    title: "Hostel Maintenance & Mess Dues - Fall 2026",
    academicYear: "2026-2027",
    semester: "Semester 1",
    totalAmount: 45000,
    dueDate: "2026-11-30",
    remarks: "Regular term accommodation charge",
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const url = filterStatus === "ALL" ? "/api/fees" : `/api/fees?status=${filterStatus}`;
      const [fRes, sRes] = await Promise.all([
        fetch(url),
        fetch("/api/students"),
      ]);

      if (fRes.ok) {
        const fData = await fRes.json();
        setFees(fData.fees || []);
      }
      if (sRes.ok) {
        const sData = await sRes.json();
        setStudents(sData.students || []);
        if (sData.students?.[0]) {
          setFormData((prev) => ({ ...prev, studentId: sData.students[0]._id }));
        }
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, [filterStatus]);

  const handleCreateFee = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/fees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          totalAmount: Number(formData.totalAmount),
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to create fee record");

      setIsModalOpen(false);
      setMessage("Fee invoice issued to student successfully.");
      setTimeout(() => setMessage(""), 3500);
      fetchFees();
    } catch (err: any) {
      alert(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Hostel Fee Invoices</h1>
          <p className="text-xs text-slate-500 mt-1">
            Issue semester room invoices, verify offline bank receipts, and review simulated payments
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex gap-1 bg-white p-1 rounded-xl border border-slate-200">
            {["ALL", "Pending", "Partially Paid", "Paid", "Overdue"].map((st) => (
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

          <Button onClick={() => setIsModalOpen(true)} className="gap-2 shrink-0">
            <Plus className="w-4 h-4" /> Issue Fee Invoice
          </Button>
        </div>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Create Fee Modal */}
      <Modal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title="Issue New Hostel Fee Invoice"
        description="Generates an official fee charge on student's account"
      >
        <form onSubmit={handleCreateFee} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Student
            </label>
            <select
              value={formData.studentId}
              onChange={(e) => setFormData({ ...formData, studentId: e.target.value })}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white"
              required
            >
              {students.map((s) => (
                <option key={s._id} value={s._id}>
                  {s.name} ({s.studentId}) - {s.profile?.department || "Student"}
                </option>
              ))}
            </select>
          </div>

          <Input
            label="Fee Description / Title"
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            required
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Fee Amount (INR)"
              type="number"
              min={1}
              value={formData.totalAmount}
              onChange={(e) => setFormData({ ...formData, totalAmount: Number(e.target.value) })}
              required
            />
            <Input
              label="Due Date"
              type="date"
              value={formData.dueDate}
              onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
              required
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Academic Year"
              value={formData.academicYear}
              onChange={(e) => setFormData({ ...formData, academicYear: e.target.value })}
              required
            />
            <Input
              label="Semester"
              value={formData.semester}
              onChange={(e) => setFormData({ ...formData, semester: e.target.value })}
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
              Issue Fee Record
            </Button>
          </div>
        </form>
      </Modal>

      {/* Fees Table */}
      <Card>
        <CardContent className="p-0 overflow-x-auto">
          {fees.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No fee invoices match the selected status filter.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-500 font-semibold uppercase tracking-wider border-b border-slate-100">
                <tr>
                  <th className="px-6 py-3.5">Student Details</th>
                  <th className="px-6 py-3.5">Invoice Title</th>
                  <th className="px-6 py-3.5">Assessed Amount</th>
                  <th className="px-6 py-3.5">Paid / Outstanding</th>
                  <th className="px-6 py-3.5">Due Date</th>
                  <th className="px-6 py-3.5">Status</th>
                  <th className="px-6 py-3.5 text-right">Transactions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {fees.map((fee) => (
                  <tr key={fee._id} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-6 py-4 font-medium text-slate-900">
                      <p className="font-bold">{fee.studentId?.name || "Student"}</p>
                      <p className="text-[11px] text-slate-500">{fee.studentId?.studentId}</p>
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-semibold text-slate-800">{fee.title}</p>
                      <p className="text-[11px] text-slate-400">{fee.academicYear}</p>
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-900 text-sm">
                      {formatCurrency(fee.totalAmount)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-emerald-600 font-semibold">
                        Paid: {formatCurrency(fee.paidAmount)}
                      </span>
                      <p className="text-rose-600 font-bold">
                        Due: {formatCurrency(fee.outstandingAmount)}
                      </p>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-700">
                      {formatDate(fee.dueDate)}
                    </td>
                    <td className="px-6 py-4">
                      <Badge
                        variant={
                          fee.status === "Paid"
                            ? "success"
                            : fee.status === "Partially Paid"
                            ? "info"
                            : fee.status === "Overdue"
                            ? "danger"
                            : "warning"
                        }
                      >
                        {fee.status}
                      </Badge>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className="text-[11px] font-semibold text-slate-500">
                        {fee.payments?.length || 0} Payments Logged
                      </span>
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
