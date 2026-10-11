"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  Home,
  Bed,
  CalendarCheck2,
  CalendarClock,
  AlertCircle,
  Megaphone,
  UtensilsCrossed,
  CreditCard,
  Users2,
  PhoneCall,
  User,
  LogOut,
  Layers,
  Bell,
  Menu,
  X,
  Building2,
} from "lucide-react";
import NotificationBell from "./NotificationBell";

export function StudentLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => {
        if (!res.ok) {
          router.push("/login");
          return null;
        }
        return res.json();
      })
      .then((data) => {
        if (data) {
          if (data.user?.role !== "student") {
            router.push("/admin/dashboard");
          } else {
            setCurrentUser(data.user);
          }
        }
      })
      .catch(() => router.push("/login"));
  }, [router]);

  const handleLogout = async () => {
    try {
      await fetch("/api/auth/logout", { method: "POST" });
      router.push("/login");
      router.refresh();
    } catch (e) {
      console.error(e);
    }
  };

  const navLinks = [
    { href: "/student/dashboard", label: "Dashboard", icon: Home },
    { href: "/student/room", label: "My Room", icon: Bed },
    { href: "/student/attendance", label: "Attendance", icon: CalendarCheck2 },
    { href: "/student/leaves", label: "Leaves", icon: CalendarClock },
    { href: "/student/complaints", label: "Complaints", icon: AlertCircle },
    { href: "/student/notices", label: "Notices", icon: Megaphone },
    { href: "/student/mess", label: "Mess Menu", icon: UtensilsCrossed },
    { href: "/student/fees", label: "Fees", icon: CreditCard },
    { href: "/student/visitors", label: "Visitors", icon: Users2 },
    { href: "/student/emergency", label: "Emergency", icon: PhoneCall },
  ];

  const mobileBottomNav = [
    { href: "/student/dashboard", label: "Home", icon: Home },
    { href: "/student/room", label: "Services", icon: Layers },
    { href: "/student/notifications", label: "Alerts", icon: Bell },
    { href: "/student/profile", label: "Profile", icon: User },
  ];

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col pb-16 md:pb-0">
      {/* Top Navbar */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-slate-200 shadow-xs">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Logo */}
            <div className="flex items-center gap-3">
              <Link
                href="/student/dashboard"
                className="flex items-center gap-2 font-bold text-slate-900 group"
              >
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-brand-700 to-indigo-500 flex items-center justify-center text-white shadow-sm shadow-brand-500/20 group-hover:scale-105 transition-transform">
                  <Building2 className="w-5 h-5" />
                </div>
                <div className="leading-tight">
                  <span className="text-lg tracking-tight font-extrabold text-navy-950">
                    Hostel<span className="text-brand-600">Hub</span>
                  </span>
                  <span className="hidden sm:block text-[10px] text-slate-400 font-medium uppercase tracking-wider">
                    Student Portal
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation Links */}
            <nav className="hidden lg:flex items-center gap-1 overflow-x-auto py-1">
              {navLinks.slice(0, 8).map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold shadow-xs"
                        : "text-slate-600 hover:text-slate-900 hover:bg-slate-100"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {link.label}
                  </Link>
                );
              })}
            </nav>

            {/* Right Action Icons */}
            <div className="flex items-center gap-3">
              <NotificationBell />

              <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-slate-200">
                <Link
                  href="/student/profile"
                  className="flex items-center gap-2 p-1.5 rounded-xl hover:bg-slate-100 transition-colors"
                >
                  <div className="h-8 w-8 rounded-full bg-brand-100 text-brand-700 flex items-center justify-center font-bold text-xs ring-2 ring-brand-500/10">
                    {currentUser?.name?.[0]?.toUpperCase() || "S"}
                  </div>
                  <div className="text-left hidden xl:block">
                    <p className="text-xs font-semibold text-slate-800 leading-none">
                      {currentUser?.name || "Student"}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5">
                      {currentUser?.studentId || "ID"}
                    </p>
                  </div>
                </Link>

                <button
                  onClick={handleLogout}
                  className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title="Log out"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>

              {/* Mobile Drawer Toggle */}
              <button
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
                className="lg:hidden p-2 text-slate-600 hover:bg-slate-100 rounded-lg"
              >
                {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
              </button>
            </div>
          </div>
        </div>

        {/* Mobile Dropdown Menu for extra links */}
        {isMobileMenuOpen && (
          <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-2 pb-6 space-y-1 animate-in slide-in-from-top-4">
            <div className="grid grid-cols-2 gap-2 pt-2">
              {navLinks.map((link) => {
                const Icon = link.icon;
                const isActive = pathname === link.href;
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setIsMobileMenuOpen(false)}
                    className={`flex items-center gap-2.5 p-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? "bg-brand-50 text-brand-700 font-semibold"
                        : "text-slate-600 hover:bg-slate-50"
                    }`}
                  >
                    <Icon className="w-4 h-4 text-brand-600" />
                    {link.label}
                  </Link>
                );
              })}
            </div>
            <div className="pt-4 mt-2 border-t border-slate-100 flex items-center justify-between">
              <Link
                href="/student/profile"
                onClick={() => setIsMobileMenuOpen(false)}
                className="text-xs font-semibold text-slate-700 flex items-center gap-2"
              >
                <User className="w-4 h-4" /> My Profile
              </Link>
              <button
                onClick={handleLogout}
                className="text-xs font-semibold text-red-600 flex items-center gap-1.5"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Main Page Content */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {children}
      </main>

      {/* Student Mobile Bottom Navigation Bar (Section 3 Requirement) */}
      <nav className="fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 py-1.5 px-6 flex justify-around items-center md:hidden shadow-lg">
        {mobileBottomNav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`flex flex-col items-center py-1 px-3 rounded-lg text-[10px] font-medium transition-colors ${
                isActive
                  ? "text-brand-600 font-bold"
                  : "text-slate-500 hover:text-slate-900"
              }`}
            >
              <Icon className={`w-5 h-5 mb-0.5 ${isActive ? "text-brand-600 stroke-[2.5]" : "text-slate-400"}`} />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
}

export default StudentLayout;
