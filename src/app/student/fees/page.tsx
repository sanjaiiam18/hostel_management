"use client";

import React, { useState, useEffect } from "react";
import { CreditCard, CheckCircle2, AlertTriangle, ShieldCheck, Clock, Receipt } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentFeesPage() {
  const [feesData, setFeesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentSuccess, setPaymentSuccess] = useState<string>("");
  const [paymentError, setPaymentError] = useState<string>("");

  const fetchFees = async () => {
    try {
      const res = await fetch("/api/fees");
      if (res.ok) {
        const data = await res.json();
        setFeesData(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const openPayModal = (fee: any) => {
    setSelectedFee(fee);
    setPayAmount(fee.outstandingAmount);
    setPaymentSuccess("");
    setPaymentError("");
    setIsPayModalOpen(true);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setPaymentError("");
    setPaymentSuccess("");

    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeRecordId: selectedFee._id,
          amount: Number(payAmount),
          notes: "Student simulated portal payment",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      setPaymentSuccess(
        `Payment successful! Reference: ${data.payment.transactionReference}. Updated balance: ₹${data.updatedFee.outstandingAmount}.`
      );

      fetchFees();
      setTimeout(() => {
        setIsPayModalOpen(false);
        setPaymentSuccess("");
      }, 2500);
    } catch (err: any) {
      setPaymentError(err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const summary = feesData?.summary || { totalFees: 0, totalPaid: 0, totalOutstanding: 0 };
  const feesList = feesData?.fees || [];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Hostel Fee Management</h1>
        <p className="text-xs text-slate-500 mt-1">
          Review semester hostel fees, receipts, and execute prototype simulated payments
        </p>
      </div>

      {/* Financial Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Total Assessed Fees
          </p>
          <p className="text-2xl font-extrabold text-slate-900 mt-1">
            {formatCurrency(summary.totalFees)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Hostel & amenities</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Total Amount Paid
          </p>
          <p className="text-2xl font-extrabold text-emerald-600 mt-1">
            {formatCurrency(summary.totalPaid)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">Verified receipts</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Outstanding Due
          </p>
          <p
            className={`text-2xl font-extrabold mt-1 ${
              summary.totalOutstanding > 0 ? "text-amber-600" : "text-slate-900"
            }`}
          >
            {formatCurrency(summary.totalOutstanding)}
          </p>
          <p className="text-[10px] text-slate-500 mt-0.5">
            {summary.totalOutstanding > 0 ? "Immediate clearance required" : "Zero dues"}
          </p>
        </Card>
      </div>

      {/* Simulated Payment Modal */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Simulated Payment Demonstration"
        description="Prototype sandbox payment - no real bank cards or financial credentials are requested"
      >
        <form onSubmit={handleSimulatePayment} className="space-y-4">
          <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 text-xs text-amber-900 flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
            <span>
              <b>Demonstration Mode:</b> This transaction simulates institutional bank gateway verification and immediately records financial reconciliation in the database.
            </span>
          </div>

          {paymentError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {paymentError}
            </div>
          )}

          {paymentSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{paymentSuccess}</span>
            </div>
          )}

          <div className="p-3 bg-slate-50 rounded-xl space-y-1 text-xs">
            <p className="font-semibold text-slate-800">{selectedFee?.title}</p>
            <p className="text-slate-500">
              Total: {formatCurrency(selectedFee?.totalAmount || 0)} • Outstanding:{" "}
              <b className="text-slate-800">{formatCurrency(selectedFee?.outstandingAmount || 0)}</b>
            </p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Payment Amount (INR)
            </label>
            <Input
              type="number"
              min={1}
              max={selectedFee?.outstandingAmount || 100000}
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsPayModalOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isProcessing}>
              Confirm Demo Payment
            </Button>
          </div>
        </form>
      </Modal>

      {/* Fee Invoices List */}
      <div className="space-y-4">
        {feesList.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Receipt className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No fee records found</p>
            <p className="text-xs text-slate-400 mt-1">
              You do not have any pending hostel charges at this time.
            </p>
          </Card>
        ) : (
          feesList.map((fee: any) => (
            <Card key={fee._id} className="p-5 hover:border-slate-300 transition-colors">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base font-bold text-slate-900">{fee.title}</h3>
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
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5">
                    Academic Year: {fee.academicYear} • Due Date: <b>{formatDate(fee.dueDate)}</b>
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <p className="text-xs text-slate-400">Outstanding</p>
                    <p className="text-lg font-extrabold text-slate-900">
                      {formatCurrency(fee.outstandingAmount)}
                    </p>
                  </div>

                  {fee.outstandingAmount > 0 && (
                    <Button onClick={() => openPayModal(fee)} size="sm" className="gap-1.5">
                      <CreditCard className="w-3.5 h-3.5" /> Pay Now
                    </Button>
                  )}
                </div>
              </div>

              {/* Payments History Drawer */}
              {fee.payments && fee.payments.length > 0 && (
                <div className="mt-4 pt-3 border-t border-slate-100">
                  <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-2">
                    Recorded Payment History
                  </p>
                  <div className="space-y-1.5">
                    {fee.payments.map((p: any) => (
                      <div
                        key={p._id}
                        className="flex items-center justify-between p-2 rounded-lg bg-slate-50 text-xs border border-slate-100"
                      >
                        <span className="font-mono text-slate-700">
                          {p.transactionReference} ({p.paymentMethod})
                        </span>
                        <div className="flex items-center gap-3">
                          <span className="text-slate-400">{formatDate(p.paymentDate)}</span>
                          <span className="font-bold text-emerald-700">
                            {formatCurrency(p.amount)}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
