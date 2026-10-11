"use client";

import React, { useState, useEffect } from "react";
import { Megaphone, Search, AlertTriangle, Bell, Calendar, User } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

export default function StudentNoticesPage() {
  const [notices, setNotices] = useState<any[]>([]);
  const [search, setSearch] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ALL");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/notices")
      .then((res) => res.json())
      .then((data) => setNotices(data.notices || []))
      .catch((e) => console.error(e))
      .finally(() => setIsLoading(false));
  }, []);

  const filteredNotices = notices.filter((n) => {
    const matchesCat = selectedCategory === "ALL" || n.category === selectedCategory;
    const matchesSearch =
      n.title.toLowerCase().includes(search.toLowerCase()) ||
      n.description.toLowerCase().includes(search.toLowerCase());
    return matchesCat && matchesSearch;
  });

  const categories = ["ALL", "General", "Academic", "Hostel", "Emergency", "Mess", "Maintenance"];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-navy-950">Notice Board</h1>
        <p className="text-xs text-slate-500 mt-1">
          Official institutional announcements, emergency circulars, and hostel updates
        </p>
      </div>

      {/* Filter and Search Bar */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Input
            placeholder="Search announcements by keywords..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1 overflow-x-auto pb-1 sm:pb-0">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-2 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>
      </div>

      {/* Notices Feed */}
      <div className="space-y-4">
        {filteredNotices.length === 0 ? (
          <Card className="p-12 text-center text-slate-400">
            <Megaphone className="w-10 h-10 mx-auto mb-2 text-slate-300" />
            <p className="text-sm font-semibold text-slate-600">No notices found</p>
            <p className="text-xs text-slate-400 mt-1">
              Check back later or try adjusting your search terms.
            </p>
          </Card>
        ) : (
          filteredNotices.map((notice) => {
            const isEmergency = notice.priority === "Emergency";
            return (
              <Card
                key={notice._id}
                className={`overflow-hidden transition-all ${
                  isEmergency
                    ? "border-rose-400 ring-2 ring-rose-500/20 shadow-md bg-rose-50/20"
                    : "hover:border-slate-300 shadow-xs"
                }`}
              >
                {isEmergency && (
                  <div className="bg-rose-600 px-4 py-1.5 text-white flex items-center gap-2 text-xs font-bold tracking-wide uppercase">
                    <AlertTriangle className="w-4 h-4 animate-bounce" />
                    High Priority Emergency Announcement
                  </div>
                )}

                <CardContent className="p-5">
                  <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <Badge
                          variant={
                            isEmergency
                              ? "danger"
                              : notice.priority === "Important"
                              ? "warning"
                              : "secondary"
                          }
                        >
                          {notice.category}
                        </Badge>
                        <span className="text-[11px] text-slate-400 flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {formatDate(notice.publicationDate)}
                        </span>
                      </div>
                      <h3
                        className={`text-base font-bold ${
                          isEmergency ? "text-rose-950" : "text-slate-900"
                        }`}
                      >
                        {notice.title}
                      </h3>
                    </div>

                    <div className="text-xs text-slate-500 flex items-center gap-1.5 shrink-0">
                      <User className="w-3.5 h-3.5 text-slate-400" />
                      <span>{notice.author}</span>
                    </div>
                  </div>

                  <p className="mt-3 text-xs leading-relaxed text-slate-700 whitespace-pre-line">
                    {notice.description}
                  </p>
                </CardContent>
              </Card>
            );
          })
        )}
      </div>
    </div>
  );
}
