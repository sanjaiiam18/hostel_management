"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { Bell, CheckCheck, ExternalLink, Calendar, CheckCircle2, RefreshCw } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDateTime } from "@/lib/utils";

export default function StudentNotificationsPage() {
  const { success } = useToast();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [filter, setFilter] = useState<"ALL" | "UNREAD">("ALL");
  const [isLoading, setIsLoading] = useState(true);

  const fetchNotifications = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/notifications");
      if (res.ok) {
        const data = await res.json();
        setNotifications(data.notifications || []);
        setUnreadCount(data.unreadCount || 0);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const markAllRead = async () => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ markAll: true }),
      });
      setUnreadCount(0);
      setNotifications((prev) => prev.map((n) => ({ ...n, isRead: true })));
      success("All Caught Up", "All notifications marked as read.");
    } catch (e) {
      console.error(e);
    }
  };

  const markSingleRead = async (id: string) => {
    try {
      await fetch("/api/notifications", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ notificationId: id }),
      });
      setNotifications((prev) =>
        prev.map((n) => (n._id === id ? { ...n, isRead: true } : n))
      );
      setUnreadCount((c) => Math.max(0, c - 1));
    } catch (e) {
      console.error(e);
    }
  };

  const filtered = notifications.filter((n) => {
    if (filter === "UNREAD") return !n.isRead;
    return true;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Hostel Notifications & Alerts
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Real-time event alerts for outpasses, fee receipts, complaints, and warden directives
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={fetchNotifications} className="h-8 text-xs gap-1.5">
            <RefreshCw className="w-3.5 h-3.5" /> Refresh
          </Button>
          {unreadCount > 0 && (
            <Button onClick={markAllRead} size="sm" className="gap-1.5 h-8 text-xs font-bold">
              <CheckCheck className="w-4 h-4" /> Mark All as Read
            </Button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 bg-slate-100 p-1 rounded-xl text-xs font-semibold w-fit">
        <button
          onClick={() => setFilter("ALL")}
          className={`px-3 py-1 rounded-lg transition-all ${
            filter === "ALL"
              ? "bg-white text-slate-900 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          All Notifications ({notifications.length})
        </button>
        <button
          onClick={() => setFilter("UNREAD")}
          className={`px-3 py-1 rounded-lg transition-all ${
            filter === "UNREAD"
              ? "bg-white text-slate-900 shadow-xs font-bold"
              : "text-slate-600 hover:text-slate-900"
          }`}
        >
          Unread ({unreadCount})
        </button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
          <CardSkeleton lines={2} />
        </div>
      ) : filtered.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <Bell className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No alerts found</p>
          <p className="text-xs text-slate-400 mt-1">
            You are completely caught up! Updates regarding your room, mess, fees, or leaves will appear here.
          </p>
        </Card>
      ) : (
        <div className="space-y-3">
          {filtered.map((n) => (
            <Card
              key={n._id}
              onClick={() => !n.isRead && markSingleRead(n._id)}
              className={`p-4 transition-all cursor-pointer hover:shadow-md ${
                n.isRead
                  ? "bg-white border-slate-200/80"
                  : "bg-brand-50/30 border-brand-300 ring-1 ring-brand-300/40 shadow-xs"
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-black text-slate-900">
                      {n.title}
                    </span>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-brand-600 animate-pulse" />
                    )}
                    <Badge variant="secondary" className="text-[10px] font-bold">
                      {n.category}
                    </Badge>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {n.message}
                  </p>
                  <p className="text-[10px] text-slate-400 pt-1">
                    {formatDateTime(n.createdAt)}
                  </p>
                </div>

                {n.linkUrl && (
                  <Link
                    href={n.linkUrl}
                    className="p-1.5 text-brand-600 hover:text-brand-800 hover:bg-brand-50 rounded-lg transition"
                    title="View related service"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </Link>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
