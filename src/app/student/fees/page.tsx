"use client";

import React, { useState, useEffect } from "react";
import {
  CreditCard,
  CheckCircle2,
  AlertTriangle,
  ShieldCheck,
  Clock,
  Receipt,
  Download,
  Printer,
  Copy,
  Check,
  Building,
  RefreshCw,
  Lock,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatCurrency, formatDate } from "@/lib/utils";

export default function StudentFeesPage() {
  const { success, error: toastError, info } = useToast();

  const [feesData, setFeesData] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Simulated Payment Modal State
  const [isPayModalOpen, setIsPayModalOpen] = useState(false);
  const [selectedFee, setSelectedFee] = useState<any>(null);
  const [payAmount, setPayAmount] = useState<number>(0);
  const [paymentMethod, setPaymentMethod] = useState<"UPI" | "NetBanking" | "DebitCard">("UPI");
  const [isProcessing, setIsProcessing] = useState(false);

  // Digital Receipt Modal State
  const [selectedReceipt, setSelectedReceipt] = useState<any>(null);
  const [copiedTxn, setCopiedTxn] = useState(false);

  const fetchFees = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/fees");
      if (res.ok) {
        const data = await res.json();
        setFeesData(data);
      }
    } catch (e) {
      console.error(e);
      toastError("Failed to fetch fees", "Please check server connectivity.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchFees();
  }, []);

  const openPayModal = (fee: any) => {
    setSelectedFee(fee);
    setPayAmount(fee.balanceAmount || fee.outstandingAmount || 0);
    setIsPayModalOpen(true);
  };

  const handleSimulatePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount <= 0) {
      toastError("Invalid Amount", "Please enter a payment amount greater than zero.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await fetch("/api/payments/simulate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          feeRecordId: selectedFee._id,
          amount: Number(payAmount),
          paymentMethod,
          notes: `Simulated portal payment via ${paymentMethod}`,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Payment failed");

      success(
        "Payment Succeeded!",
        `Receipt #${data.payment?.transactionReference || "TXN-OK"}. Balance updated to ₹${data.updatedFee?.balanceAmount ?? 0}.`
      );

      setIsPayModalOpen(false);
      fetchFees();
    } catch (err: any) {
      toastError("Payment Failed", err.message);
    } finally {
      setIsProcessing(false);
    }
  };

  const summary = feesData?.summary || { totalFees: 0, totalPaid: 0, totalOutstanding: 0 };
  const feesList = feesData?.fees || (feesData?.currentRecord ? [feesData.currentRecord] : []);
  const paymentsList = feesData?.paymentHistory || [];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Hostel Fees & Digital Fee Receipts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Semester hostel room & mess fee ledger with instant receipt generation and sandbox simulator
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchFees} className="gap-1.5 h-8 text-xs font-semibold">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh Dues
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <StatCardSkeleton key={i} />
            ))}
          </div>
          <CardSkeleton lines={5} />
        </div>
      ) : (
        <>
          {/* Financial Summary Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Card className="p-5 border-slate-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Assessed Dues
              </p>
              <p className="text-3xl font-black text-slate-900 mt-1">
                {formatCurrency(summary.totalFees || 36000)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Hostel Room + 4-Meal Mess Plan</p>
            </Card>

            <Card className="p-5 border-emerald-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Total Amount Paid
              </p>
              <p className="text-3xl font-black text-emerald-600 mt-1">
                {formatCurrency(summary.totalPaid || 0)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">Cleared via Bank Transfer / UPI</p>
            </Card>

            <Card className="p-5 border-rose-200/80 shadow-xs">
              <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                Outstanding Balance
              </p>
              <p className="text-3xl font-black text-rose-600 mt-1">
                {formatCurrency(summary.totalOutstanding || 0)}
              </p>
              <p className="text-[10px] text-slate-400 mt-1">
                {(summary.totalOutstanding || 0) === 0 ? "All dues cleared for Spring 2026" : "Due date: End of Month"}
              </p>
            </Card>
          </div>

          {/* Active Fee Ledger Table */}
          <Card className="shadow-xs">
            <CardHeader className="p-4 border-b border-slate-100 flex flex-row items-center justify-between">
              <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
                <Receipt className="w-4 h-4 text-brand-600" />
                Current Semester Fee Schedule
              </CardTitle>
              <span className="text-xs text-slate-400 font-medium">Session 2025-26</span>
            </CardHeader>
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead className="bg-slate-50/70 border-b border-slate-100 text-[10px] font-bold text-slate-500 uppercase tracking-wider">
                    <tr>
                      <th className="py-3 px-4">Semester</th>
                      <th className="py-3 px-4">Total Fee</th>
                      <th className="py-3 px-4">Paid</th>
                      <th className="py-3 px-4">Balance</th>
                      <th className="py-3 px-4">Status</th>
                      <th className="py-3 px-4 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-100 font-medium">
                    {feesList.map((fee: any) => {
                      const bal = fee.balanceAmount ?? fee.outstandingAmount ?? 0;
                      return (
                        <tr key={fee._id} className="hover:bg-slate-50/60 transition">
                          <td className="py-3 px-4 font-bold text-slate-900">
                            {fee.academicYear || "Year 3"} &bull; {fee.semester || "Spring 2026"}
                          </td>
                          <td className="py-3 px-4 text-slate-800">
                            {formatCurrency(fee.totalFee || fee.totalAmount || 36000)}
                          </td>
                          <td className="py-3 px-4 text-emerald-600 font-bold">
                            {formatCurrency(fee.paidAmount || 0)}
                          </td>
                          <td className="py-3 px-4 text-rose-600 font-bold">
                            {formatCurrency(bal)}
                          </td>
                          <td className="py-3 px-4">
                            <Badge variant={bal === 0 ? "success" : fee.paidAmount > 0 ? "warning" : "danger"}>
                              {bal === 0 ? "Paid" : fee.paidAmount > 0 ? "Partial" : "Unpaid"}
                            </Badge>
                          </td>
                          <td className="py-3 px-4 text-right">
                            {bal > 0 ? (
                              <Button
                                size="sm"
                                variant="primary"
                                onClick={() => openPayModal(fee)}
                                className="h-7 text-xs font-bold gap-1 shadow-xs"
                              >
                                <CreditCard className="w-3.5 h-3.5" /> Pay Balance
                              </Button>
                            ) : (
                              <span className="text-xs text-emerald-600 font-semibold inline-flex items-center gap-1">
                                <CheckCircle2 className="w-4 h-4" /> Dues Clear
                              </span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      )}

      {/* SIMULATED PAYMENT MODAL */}
      <Modal
        isOpen={isPayModalOpen}
        onClose={() => setIsPayModalOpen(false)}
        title="Hostel Fee Payment Sandbox"
        description="Execute simulated payment clearance for institutional ledger testing."
      >
        <form onSubmit={handleSimulatePayment} className="space-y-4">
          <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
            <div className="flex justify-between">
              <span className="text-slate-500">Institution:</span>
              <span className="font-bold text-slate-800">National Institute of Technology</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Beneficiary:</span>
              <span className="font-bold text-slate-800">NIT Hostel Welfare Fund</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Semester:</span>
              <span className="font-semibold text-slate-700">Spring 2026 (Room + Dining)</span>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Method
            </label>
            <div className="grid grid-cols-3 gap-2">
              {(["UPI", "NetBanking", "DebitCard"] as const).map((method) => (
                <button
                  key={method}
                  type="button"
                  onClick={() => setPaymentMethod(method)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition text-center cursor-pointer active:scale-95 ${
                    paymentMethod === method
                      ? "border-brand-600 bg-brand-50 text-brand-700 shadow-xs"
                      : "border-slate-200 text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {method === "UPI" ? "UPI (GPay/PhonePe)" : method === "NetBanking" ? "Net Banking" : "Debit Card"}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">
              Payment Amount (₹)
            </label>
            <Input
              type="number"
              min={1}
              value={payAmount}
              onChange={(e) => setPayAmount(Number(e.target.value))}
              required
            />
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400 pt-1">
            <Lock className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>256-Bit SSL Encrypted Sandbox Gateway. Instant Receipt Dispatched.</span>
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsPayModalOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isProcessing}
              className="font-bold gap-1.5"
            >
              Confirm & Pay {formatCurrency(payAmount)}
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
