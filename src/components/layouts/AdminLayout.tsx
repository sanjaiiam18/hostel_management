"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  CalendarCheck2,
  CalendarClock,
  AlertCircle,
  Megaphone,
  UtensilsCrossed,
  CreditCard,
  UserCheck,
  BarChart3,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  ShieldAlert,
} from "lucide-react";
import NotificationBell from "./NotificationBell";
import { Logo } from "@/components/ui/logo";

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [isCollapsed, setIsCollapsed] = useState(false);
  const [isMobileDrawerOpen, setIsMobileDrawerOpen] = useState(false);

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
          if (data.user?.role !== "admin" && data.user?.role !== "warden") {
            router.push("/student/dashboard");
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

  const navItems = [
    { href: "/admin/dashboard", label: "Dashboard", icon: LayoutDashboard },
    { href: "/admin/students", label: "Students", icon: Users },
    { href: "/admin/rooms", label: "Hostel & Rooms", icon: Building2 },
    { href: "/admin/attendance", label: "Attendance", icon: CalendarCheck2 },
    { href: "/admin/leaves", label: "Leave Requests", icon: CalendarClock },
    { href: "/admin/complaints", label: "Complaints", icon: AlertCircle },
    { href: "/admin/notices", label: "Notices", icon: Megaphone },
    { href: "/admin/mess", label: "Mess Management", icon: UtensilsCrossed },
    { href: "/admin/fees", label: "Fees", icon: CreditCard },
    { href: "/admin/visitors", label: "Visitors", icon: UserCheck },
    { href: "/admin/reports", label: "Reports", icon: BarChart3 },
    { href: "/admin/settings", label: "Settings", icon: Settings },
  ];

  return (
    <div className="min-h-screen bg-slate-100/70 flex max-w-full overflow-x-hidden">
      {/* Desktop Collapsible Sidebar */}
      <aside
        className={`hidden md:flex flex-col bg-navy-950 text-slate-300 border-r border-navy-900 transition-all duration-300 z-30 select-none ${
          isCollapsed ? "w-20" : "w-64"
        }`}
      >
        {/* Brand Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-navy-900/80">
          {!isCollapsed && (
            <Logo
              href="/admin/dashboard"
              size="sm"
              isDarkTheme
              subtitle="Admin Console"
            />
          )}

          {isCollapsed && (
            <Logo
              href="/admin/dashboard"
              size="sm"
              isDarkTheme
              imageOnly
              className="mx-auto"
            />
          )}

          <button
            onClick={() => setIsCollapsed(!isCollapsed)}
            className="hidden md:flex p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-navy-900 transition ml-auto"
            title={isCollapsed ? "Expand sidebar" : "Collapse sidebar"}
          >
            {isCollapsed ? (
              <ChevronRight className="w-4 h-4" />
            ) : (
              <ChevronLeft className="w-4 h-4" />
            )}
          </button>
        </div>

        {/* Navigation list */}
        <div className="flex-1 overflow-y-auto py-4 px-3 space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? "bg-brand-600 text-white font-semibold shadow-sm"
                    : "text-slate-300 hover:text-white hover:bg-navy-900/70"
                } ${isCollapsed ? "justify-center" : ""}`}
                title={isCollapsed ? item.label : undefined}
              >
                <Icon className="w-4 h-4 shrink-0" />
                {!isCollapsed && <span>{item.label}</span>}
              </Link>
            );
          })}
        </div>

        {/* User Card & Logout */}
        <div className="p-3 border-t border-navy-900/80 bg-navy-950/60">
          <div
            className={`flex items-center gap-3 p-2 rounded-xl bg-navy-900/60 ${
              isCollapsed ? "justify-center" : ""
            }`}
          >
            <div className="h-8 w-8 rounded-full bg-brand-500/20 text-brand-300 border border-brand-500/30 flex items-center justify-center font-bold text-xs shrink-0">
              {currentUser?.name?.[0]?.toUpperCase() || "A"}
            </div>
            {!isCollapsed && (
              <div className="flex-1 min-w-0">
                <p className="text-xs font-semibold text-white truncate">
                  {currentUser?.name || "Admin"}
                </p>
                <p className="text-[10px] text-brand-400 capitalize truncate">
                  {currentUser?.role || "Warden"}
                </p>
              </div>
            )}
            <button
              onClick={handleLogout}
              className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-navy-800 rounded-lg transition"
              title="Logout"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Mobile Drawer */}
      {isMobileDrawerOpen && (
        <div className="fixed inset-0 z-50 flex md:hidden">
          <div
            className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm"
            onClick={() => setIsMobileDrawerOpen(false)}
          />
          <div className="relative w-72 max-w-[85vw] bg-navy-950 text-slate-300 flex flex-col p-4 pb-[calc(1.5rem+env(safe-area-inset-bottom,0px))] shadow-2xl animate-in slide-in-from-left duration-200">
            <div className="flex items-center justify-between pb-4 border-b border-navy-900">
              <Logo href="/admin/dashboard" size="xs" isDarkTheme subtitle="Admin Console" />
              <button
                onClick={() => setIsMobileDrawerOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-1">
              {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = pathname === item.href;
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    onClick={() => setIsMobileDrawerOpen(false)}
                    className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition ${
                      isActive
                        ? "bg-brand-600 text-white font-semibold"
                        : "text-slate-300 hover:bg-navy-900 hover:text-white"
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span>{item.label}</span>
                  </Link>
                );
              })}
            </div>

            <div className="pt-3 border-t border-navy-900 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-white">{currentUser?.name}</p>
                <p className="text-[10px] text-slate-400 capitalize">{currentUser?.role}</p>
              </div>
              <button
                onClick={handleLogout}
                className="p-2 text-rose-400 hover:bg-navy-900 rounded-lg text-xs flex items-center gap-1"
              >
                <LogOut className="w-4 h-4" /> Logout
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="flex-1 flex flex-col min-w-0 max-w-full overflow-x-hidden">
        {/* Top Header */}
        <header className="sticky top-0 z-20 bg-white/95 backdrop-blur-md border-b border-slate-200/80 px-3.5 sm:px-6 lg:px-8 h-16 flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsMobileDrawerOpen(true)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <h1 className="text-base font-bold text-slate-800 capitalize leading-tight">
                {pathname.split("/").pop()?.replace("-", " ") || "Dashboard"}
              </h1>
              <p className="text-[11px] text-slate-400 hidden sm:block">
                Administrative Workspace
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium border border-emerald-200/60">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              Live System Active
            </div>

            <NotificationBell />
          </div>
        </header>

        {/* Content Area */}
        <main className="flex-1 p-3.5 sm:p-6 lg:p-8 max-w-7xl w-full mx-auto min-w-0 overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}

export default AdminLayout;
