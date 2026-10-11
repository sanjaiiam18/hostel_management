"use client";

import React, { useState, useEffect } from "react";
import {
  Megaphone,
  Search,
  AlertTriangle,
  Bell,
  Calendar,
  User,
  Share2,
  Check,
  RefreshCw,
  ExternalLink,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Modal } from "@/components/ui/modal";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";
import { formatDate } from "@/lib/utils";

export default function StudentNoticesPage() {
  const { success } = useToast();
  const [notices, setNotices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);
  const [selectedNotice, setSelectedNotice] = useState<any>(null);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const fetchNotices = () => {
    setIsLoading(true);
    fetch("/api/notices")
      .then((res) => res.json())
      .then((data) => setNotices(data.notices || []))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  };

  useEffect(() => {
    fetchNotices();
  }, []);

  const filteredNotices = notices.filter((n) => {
    const matchesCat = selectedCategory === "ALL" || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ["ALL", "General", "Academic", "Discipline", "Emergency", "Mess", "Maintenance"];

  const handleShareNotice = (notice: any) => {
    navigator.clipboard.writeText(`${notice.title}\n\n${notice.description}\n\n- ${notice.author} (NIT Hostel Bulletin)`);
    setCopiedId(notice._id);
    success("Notice Copied", "Announcement copied to clipboard for sharing.");
    setTimeout(() => setCopiedId(null), 2000);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Hostel Notice Board & Circulars
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Official administrative announcements, inspection circulars, and mess committee updates
          </p>
        </div>
        <Button size="sm" variant="outline" onClick={fetchNotices} className="gap-1.5 h-8 text-xs font-semibold self-end sm:self-auto">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search circulars by keyword..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="h-9 text-xs bg-white"
          />
        </div>
        <div className="flex gap-1.5 overflow-x-auto pb-1 sm:pb-0 bg-slate-100 p-1 rounded-xl">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                selectedCategory === cat
                  ? "bg-white text-navy-950 shadow-xs font-black"
                  : "text-slate-600 hover:text-slate-900"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      {isLoading ? (
        <div className="space-y-4">
          <CardSkeleton lines={3} />
          <CardSkeleton lines={3} />
        </div>
      ) : filteredNotices.length === 0 ? (
        <Card className="p-12 text-center text-slate-400">
          <Megaphone className="w-10 h-10 mx-auto mb-2 text-slate-300" />
          <p className="text-sm font-bold text-slate-700">No notices found</p>
          <p className="text-xs text-slate-400 mt-1">
            No circulars match your selected search or filter category.
          </p>
        </Card>
      ) : (
        <div className="space-y-4">
          {filteredNotices.map((notice) => {
            const isEmergency = notice.priority === "Emergency";
            const isImportant = notice.priority === "Important";
            return (
              <Card
                key={notice._id}
                className={`overflow-hidden transition-all hover:shadow-md ${
                  isEmergency
                    ? "border-rose-300 ring-2 ring-rose-500/20 shadow-md bg-rose-50/20"
                    : isImportant
                    ? "border-amber-300/80 bg-amber-50/10"
                    : "border-slate-200/80"
                }`}
              >
                {isEmergency && (
                  <div className="bg-rose-600 px-4 py-1.5 text-white flex items-center gap-2 text-xs font-black tracking-wide uppercase">
                    <AlertTriangle className="w-4 h-4" />
                    High Priority Emergency Notice
                  </div>
                )}

                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <Badge variant="secondary" className="font-bold">
                          {notice.category}
                        </Badge>
                        {isEmergency ? (
                          <Badge variant="danger">Emergency</Badge>
                        ) : isImportant ? (
                          <Badge variant="warning">Important</Badge>
                        ) : null}
                        <h2 className="text-base font-black text-slate-900 tracking-tight">
                          {notice.title}
                        </h2>
                      </div>

                      <p className="text-xs text-slate-700 leading-relaxed whitespace-pre-wrap pt-1">
                        {notice.description}
                      </p>

                      <div className="flex flex-wrap items-center gap-3 text-[11px] text-slate-400 pt-2">
                        <span className="flex items-center gap-1 font-semibold text-slate-600">
                          <User className="w-3.5 h-3.5 text-brand-600" /> {notice.author}
                        </span>
                        <span>&bull;</span>
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3.5 h-3.5" /> Published {formatDate(notice.publicationDate)}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-start">
                      <button
                        onClick={() => handleShareNotice(notice)}
                        className="p-2 rounded-xl border border-slate-200 hover:bg-slate-50 text-slate-500 hover:text-slate-800 transition active:scale-95"
                        title="Copy notice text"
                      >
                        {copiedId === notice._id ? (
                          <Check className="w-4 h-4 text-emerald-600" />
                        ) : (
                          <Share2 className="w-4 h-4" />
                        )}
                      </button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
