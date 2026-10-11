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
} from "lucide-react";

export default function HomePage() {
  const features = [
    {
      title: "Hostel & Room Hierarchy",
      description: "Hostel, Block, Floor, Room, and Bed allocation with real-time occupancy tracking.",
      icon: Bed,
      color: "bg-blue-50 text-blue-600",
    },
    {
      title: "Roll-Call Attendance",
      description: "Daily attendance monitoring, automatic percentage calculation, and bulk roll-call.",
      icon: CalendarCheck2,
      color: "bg-emerald-50 text-emerald-600",
    },
    {
      title: "Digital Leave Outpasses",
      description: "Students apply online; wardens verify destination and parent contacts with 1-click approvals.",
      icon: CalendarClock,
      color: "bg-purple-50 text-purple-600",
    },
    {
      title: "Maintenance Ticketing",
      description: "Fast complaint dispatch for electrical, plumbing, Wi-Fi, and high-priority security issues.",
      icon: AlertCircle,
      color: "bg-amber-50 text-amber-600",
    },
    {
      title: "Weekly Mess Menu & Ratings",
      description: "7-day dining schedules with anonymous student ratings on food quality, taste, and cleanliness.",
      icon: UtensilsCrossed,
      color: "bg-orange-50 text-orange-600",
    },
    {
      title: "Fees & Payment Simulation",
      description: "Semester fee assessment, payment tracking, balance calculation, and sandbox simulation demo.",
      icon: CreditCard,
      color: "bg-rose-50 text-rose-600",
    },
    {
      title: "Security Gate Visitor Passes",
      description: "Pre-register family visits, warden clearance, and security check-in / check-out time logs.",
      icon: UserCheck,
      color: "bg-cyan-50 text-cyan-600",
    },
    {
      title: "24/7 Emergency Directory",
      description: "One-touch direct tel: links for chief warden, security desk, ambulance, and medical staff.",
      icon: PhoneCall,
      color: "bg-red-50 text-red-600",
    },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col selection:bg-brand-500 selection:text-white">
      {/* Top Navbar */}
      <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white shadow-md shadow-brand-500/20">
              <Building2 className="w-5 h-5" />
            </div>
            <span className="text-xl font-black text-navy-950 tracking-tight">
              Hostel<span className="text-brand-600">Hub</span>
            </span>
          </div>

          <div className="flex items-center gap-3">
            <Link
              href="/login"
              className="text-xs font-semibold text-slate-700 hover:text-slate-900 px-3 py-2 rounded-lg hover:bg-slate-100 transition"
            >
              Sign In
            </Link>
            <Link
              href="/register"
              className="text-xs font-semibold text-white bg-brand-600 hover:bg-brand-700 px-4 py-2 rounded-lg transition shadow-xs"
            >
              Student Registration
            </Link>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 bg-gradient-to-b from-white via-slate-50 to-slate-100 border-b border-slate-200/80">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-brand-50 border border-brand-200 text-brand-700 text-xs font-semibold mb-6 animate-in fade-in">
            <Sparkles className="w-3.5 h-3.5" />
            Institutional Hostel Management System
          </div>

          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black text-navy-950 tracking-tight max-w-4xl mx-auto leading-tight">
            Digitize Campus Living for <span className="text-brand-600">Students & Wardens</span>
          </h1>

          <p className="mt-5 text-base sm:text-lg text-slate-600 max-w-2xl mx-auto leading-relaxed">
            A comprehensive, full-stack platform centralizing room bed allocation, biometric roll-call attendance, leave requests, cafeteria menus, maintenance ticketing, and fee tracking.
          </p>

          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
            <Link
              href="/login"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-brand-600 hover:bg-brand-700 text-white font-bold text-sm transition shadow-lg shadow-brand-500/25 flex items-center justify-center gap-2"
            >
              Enter Application Portal <ArrowRight className="w-4 h-4" />
            </Link>
            <Link
              href="/register"
              className="w-full sm:w-auto px-6 py-3.5 rounded-xl bg-white hover:bg-slate-50 text-slate-800 font-bold text-sm border border-slate-300 transition shadow-sm"
            >
              New Student Registration
            </Link>
          </div>

          {/* Institutional Highlights Badge */}
          <div className="mt-12 flex flex-wrap items-center justify-center gap-6 text-xs text-slate-500">
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Role-Based Access Control
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Real-time Audit Trail
            </span>
            <span className="flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Exportable Institutional Reports
            </span>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex-1">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-extrabold text-navy-950">
            Comprehensive Operational Modules
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-2 max-w-xl mx-auto">
            Replacing paper-based records with structured, automated, and secure digital workflows
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feat) => {
            const Icon = feat.icon;
            return (
              <div
                key={feat.title}
                className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs hover:shadow-md transition-shadow"
              >
                <div className={`p-3 rounded-xl w-fit mb-3.5 ${feat.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
                <h3 className="text-sm font-bold text-slate-900 mb-1">{feat.title}</h3>
                <p className="text-xs text-slate-600 leading-relaxed">{feat.description}</p>
              </div>
            );
          })}
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-navy-950 text-slate-400 py-8 border-t border-navy-900 text-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-white font-bold">
            <Building2 className="w-4 h-4 text-brand-400" />
            <span>HostelHub • Educational Institutions Management System</span>
          </div>
          <p className="text-slate-500">
            Designed for educational institution project review & demonstration.
          </p>
        </div>
      </footer>
    </div>
  );
}
