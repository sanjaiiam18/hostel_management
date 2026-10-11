"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  Building2,
  Shield,
  Users,
  Bed,
  CalendarCheck2,
  CalendarClock,
  AlertCircle,
  UtensilsCrossed,
  CreditCard,
  UserCheck,
  PhoneCall,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  QrCode,
  Lock,
  ChevronRight,
  Clock,
  Compass,
} from "lucide-react";

export default function HomePage() {
  const [activeTab, setActiveTab] = useState<"student" | "warden">("student");

  const studentFeatures = [
    {
      title: "Digital Gate Outpasses",
      desc: "Apply online in 30 seconds. Get verified digital QR passes stamped by the Warden for campus security turnstiles.",
      icon: CalendarClock,
      badge: "Fast Approval",
    },
    {
      title: "Maintenance Helpdesk",
      desc: "Report room electrical, plumbing, or Wi-Fi faults with priority dispatch to on-campus technicians.",
      icon: AlertCircle,
      badge: "< 24h Turnaround",
    },
    {
      title: "Weekly Dining & Ratings",
      desc: "Check 4-meal daily dining menus with anonymous 5-star ratings that directly impact monthly catering vendors.",
      icon: UtensilsCrossed,
      badge: "FSSAI Grade A",
    },
    {
      title: "Room Blueprint & Amenities",
      desc: "Inspect your assigned room, bed letter, roommate profile, and complete move-in inventory checklist.",
      icon: Bed,
      badge: "Live Allocation",
    },
    {
      title: "Fee Ledger & Sandbox Pay",
      desc: "Instant breakdown of hostel rent and dining plan with sandbox payment simulator and downloadable receipts.",
      icon: CreditCard,
      badge: "Instant Receipts",
    },
    {
      title: "Security Visitor Passes",
      desc: "Pre-register visiting parents and relatives to guarantee turnstile clearance at the main gate.",
      icon: UserCheck,
      badge: "Gate Clearance",
    },
  ];

  const wardenFeatures = [
    {
      title: "Residential Census & Beds",
      desc: "Manage hostel blocks, floors, rooms, and bed vacancies with real-time occupancy meters and reallocations.",
      icon: Building2,
      badge: "Live Inventory",
    },
    {
      title: "Night Roll-Call Attendance",
      desc: "Conduct daily room-to-room roll-calls with instant percentage tracking and minimum 75% shortage alerts.",
      icon: CalendarCheck2,
      badge: "Automated Ratios",
    },
    {
      title: "Outpass Approval Console",
      desc: "Review student travel destinations, parent consents, and issue 1-click digital clearance slips.",
      icon: CalendarClock,
      badge: "1-Click Approvals",
    },
    {
      title: "Maintenance Dispatch Matrix",
      desc: "Assign open student complaints to electricians and plumbers, log repair notes, and resolve work orders.",
      icon: AlertCircle,
      badge: "Technician Dispatch",
    },
    {
      title: "Dining Menu Governance",
      desc: "Publish 7-day dining schedules, monitor student satisfaction ratings, and review kitchen cleanliness.",
      icon: UtensilsCrossed,
      badge: "Vendor Audit",
    },
    {
      title: "Auditing & Census Reports",
      desc: "Export printable room census records, fee collection balance sheets, and student rosters to CSV.",
      icon: Shield,
      badge: "Export CSV / Print",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-600 selection:text-white">
      {/* Top Academic Sub-Bar */}
      <div className="bg-navy-950 text-slate-300 py-1.5 px-4 text-[11px] font-semibold border-b border-navy-900">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>National Institute of Technology &bull; Campus Residential Life Directorate</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-slate-400">
            <span>Spring Semester 2026</span>
            <span>&bull;</span>
            <span>Curfew: 09:30 PM Strictly Enforced</span>
          </div>
        </div>
      </div>

      {/* Main Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-brand-500/25">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-black text-navy-950 tracking-tight leading-none block">
                Hostel<span className="text-brand-600">Hub</span>
              </span>
              <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider block">
                Residential Governance
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <Link
              href="/login"
              className="text-xs font-bold text-slate-700 hover:text-slate-900 px-3.5 py-2 rounded-xl hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-bold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-xl transition shadow-xs hover:shadow-md"
            >
              Student Registration &rarr;
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-20 bg-gradient-to-b from-white via-slate-50 to-slate-100/60 border-b border-slate-200">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-bold mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Institutional Hostel Management System &bull; 2026 Edition
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight leading-tight">
            Seamless Campus Living for <br className="hidden sm:inline" />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-brand-600 to-indigo-600">
              Students &amp; Hostel Wardens
            </span>
          </h1>

          <p className="mt-5 text-sm sm:text-base text-slate-600 max-w-2xl mx-auto leading-relaxed">
            Eliminating paper registers and manual gate passes. A unified, role-based platform for room bed assignments, nightly roll-call attendance, leave passes, dining menus, and maintenance dispatch.
          </p>

          {/* Instant 1-Click Evaluation Triggers */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              Enter Application Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 transition shadow-xs flex items-center justify-center gap-2 cursor-pointer active:scale-95"
            >
              <Shield className="w-4 h-4 text-indigo-600" />
              1-Click Demo Logins
            </Link>
          </div>

          {/* Quick Institutional Highlights */}
          <div className="mt-12 pt-8 border-t border-slate-200/80 flex flex-wrap items-center justify-center gap-6 text-xs font-semibold text-slate-600">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> 100% Persistent Database
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> QR-Verifiable Gate Passes
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time Biometric Roll-Call
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Role-Based Security (RBAC)
            </span>
          </div>
        </div>

        {/* Subtle background blur accents */}
        <div className="absolute -top-24 -left-24 w-72 h-72 bg-brand-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
      </section>

      {/* Interactive Module Explorer Tabs */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="text-center mb-8">
          <h2 className="text-2xl sm:text-3xl font-black text-navy-950 tracking-tight">
            Explore Residential Workflows
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-lg mx-auto">
            Switch between Student Services and Warden Administration to preview active capabilities
          </p>

          {/* Tab Selector */}
          <div className="inline-flex mt-6 p-1 rounded-2xl bg-slate-200/80 text-xs font-bold">
            <button
              onClick={() => setActiveTab("student")}
              className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "student"
                  ? "bg-white text-navy-950 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Student Portal Features (Resident View)
            </button>
            <button
              onClick={() => setActiveTab("warden")}
              className={`px-5 py-2.5 rounded-xl transition-all cursor-pointer ${
                activeTab === "warden"
                  ? "bg-white text-navy-950 shadow-sm font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              Warden Administration (Governance Console)
            </button>
          </div>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5 animate-in fade-in duration-300">
          {(activeTab === "student" ? studentFeatures : wardenFeatures).map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-all space-y-3 flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-center justify-between mb-3">
                    <div className="p-2.5 rounded-xl bg-brand-50 text-brand-600">
                      <Icon className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-slate-100 text-slate-700">
                      {f.badge}
                    </span>
                  </div>
                  <h3 className="text-base font-black text-slate-900 tracking-tight">
                    {f.title}
                  </h3>
                  <p className="text-xs text-slate-600 leading-relaxed mt-1">
                    {f.desc}
                  </p>
                </div>

                <div className="pt-2 border-t border-slate-100">
                  <Link
                    href="/login"
                    className="text-xs font-bold text-brand-600 hover:text-brand-800 flex items-center gap-1 group"
                  >
                    Experience in portal
                    <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* Collegiate Footer */}
      <footer className="bg-navy-950 text-slate-400 py-8 border-t border-navy-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>HostelHub &bull; National Institute of Technology</span>
          </div>
          <p className="text-slate-500">
            Engineered with Next.js App Router, TypeScript, Mongoose, and Tailwind CSS.
          </p>
        </div>
      </footer>
    </div>
  );
}
