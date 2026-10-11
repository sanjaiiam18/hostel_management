"use client";

import React, { useState, useEffect } from "react";
import { BarChart3, Download, Printer, Search, FileSpreadsheet, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

const reportTypes = [
  { id: "student", label: "Student Roster" },
  { id: "occupancy", label: "Room Occupancy" },
  { id: "attendance", label: "Attendance History" },
  { id: "leave", label: "Leave Requests" },
  { id: "complaint", label: "Complaints & Maintenance" },
  { id: "fee", label: "Fee & Collections" },
  { id: "visitor", label: "Visitor Passes" },
];

export default function AdminReportsPage() {
  const [selectedType, setSelectedType] = useState("student");
  const [reportData, setReportData] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchReport = async (type: string) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/reports?type=${type}&format=json`);
      if (res.ok) {
        const json = await res.json();
        setReportData(json.data || []);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchReport(selectedType);
  }, [selectedType]);

  const handlePrint = () => {
    window.print();
  };

  const headers = reportData.length > 0 ? Object.keys(reportData[0]) : [];

  return (
    <div className="space-y-6">
      {/* Header (hidden in print) */}
      <div className="no-print flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Institutional Reports & Analytics</h1>
          <p className="text-xs text-slate-500 mt-1">
            Generate administrative audits, printable summaries, and CSV data exports
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button onClick={handlePrint} variant="outline" size="sm" className="gap-2">
            <Printer className="w-4 h-4" /> Print Report
          </Button>
          <a
            href={`/api/reports?type=${selectedType}&format=csv`}
            download
            className="inline-flex items-center justify-center gap-2 px-4 py-2 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold transition shadow-xs"
          >
            <Download className="w-4 h-4" /> Export CSV File
          </a>
        </div>
      </div>

      {/* Report Selector Pills */}
      <div className="no-print flex gap-1.5 overflow-x-auto pb-1 bg-white p-2 rounded-2xl border border-slate-200">
        {reportTypes.map((r) => (
          <button
            key={r.id}
            onClick={() => setSelectedType(r.id)}
            className={`px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition ${
              selectedType === r.id
                ? "bg-brand-600 text-white shadow-sm"
                : "text-slate-600 hover:bg-slate-100"
            }`}
          >
            {r.label}
          </button>
        ))}
      </div>

      {/* Printable Report Header */}
      <div className="print-only hidden p-4 mb-4 border-b border-slate-300">
        <h2 className="text-2xl font-bold">HostelHub - Institutional Report</h2>
        <p className="text-sm">
          Report: {reportTypes.find((r) => r.id === selectedType)?.label} • Generated on{" "}
          {new Date().toLocaleString()}
        </p>
      </div>

      {/* Report Table Card */}
      <Card>
        <CardHeader className="no-print p-4 border-b border-slate-100 flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800">
            {reportTypes.find((r) => r.id === selectedType)?.label} Preview ({reportData.length} Records)
          </CardTitle>
          <button
            onClick={() => fetchReport(selectedType)}
            className="text-xs text-slate-500 hover:text-slate-800 flex items-center gap-1"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </button>
        </CardHeader>

        <CardContent className="p-0 overflow-x-auto">
          {reportData.length === 0 ? (
            <div className="p-12 text-center text-slate-400 text-xs">
              No records found for this report.
            </div>
          ) : (
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  {headers.map((h) => (
                    <th key={h} className="px-5 py-3">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {reportData.map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50/70">
                    {headers.map((h) => (
                      <td key={h} className="px-5 py-3 text-slate-800 font-medium whitespace-nowrap">
                        {String(row[h] ?? "")}
                      </td>
                    ))}
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
