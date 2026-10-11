"use client";

import React, { useState, useEffect } from "react";
import { UtensilsCrossed, Save, Star, MessageSquare, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { formatDate } from "@/lib/utils";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function AdminMessPage() {
  const [activeDay, setActiveDay] = useState("monday");
  const [weekNumber, setWeekNumber] = useState(41);
  const [year, setYear] = useState(2026);
  const [title, setTitle] = useState("Regular Hostel Mess Menu - Term 1");
  const [schedule, setSchedule] = useState<Record<string, any>>({
    monday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    tuesday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    wednesday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    thursday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    friday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    saturday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
    sunday: { breakfast: "", lunch: "", snacks: "", dinner: "" },
  });

  const [feedbackStats, setFeedbackStats] = useState<any>(null);
  const [recentComments, setRecentComments] = useState<any[]>([]);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState("");

  const fetchMessData = async () => {
    try {
      const [menuRes, fbRes] = await Promise.all([
        fetch(`/api/mess-menu?week=${weekNumber}&year=${year}`),
        fetch("/api/food-feedback"),
      ]);

      if (menuRes.ok) {
        const m = await menuRes.json();
        if (m.menu) {
          setTitle(m.menu.title);
          setSchedule(m.menu.schedule);
        }
      }

      if (fbRes.ok) {
        const f = await fbRes.json();
        setFeedbackStats(f.stats);
        setRecentComments(f.recentComments || []);
      }
    } catch (e) {
      console.error(e);
    }
  };

  useEffect(() => {
    fetchMessData();
  }, []);

  const handleMealChange = (meal: string, value: string) => {
    setSchedule((prev) => ({
      ...prev,
      [activeDay]: {
        ...prev[activeDay],
        [meal]: value,
      },
    }));
  };

  const handleSaveMenu = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const res = await fetch("/api/mess-menu", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title,
          weekNumber,
          year,
          schedule,
          status: "Published",
        }),
      });

      if (res.ok) {
        setMessage("Weekly mess menu updated and published successfully!");
        setTimeout(() => setMessage(""), 3500);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Mess & Dining Management</h1>
          <p className="text-xs text-slate-500 mt-1">
            Configure weekly meal menus and inspect anonymous student feedback
          </p>
        </div>
        <Button onClick={handleSaveMenu} isLoading={isSaving} className="gap-2 shrink-0">
          <Save className="w-4 h-4" /> Save Weekly Menu
        </Button>
      </div>

      {message && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-semibold rounded-xl flex items-center gap-2">
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>{message}</span>
        </div>
      )}

      {/* Aggregate Student Ratings Overview (Section 13) */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Overall Rating
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-extrabold text-amber-500">
              {feedbackStats?.overallRating ?? 4.4}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">
            Based on {feedbackStats?.totalResponses ?? 0} reviews
          </p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Food Quality
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-extrabold text-emerald-600">
              {feedbackStats?.avgQuality ?? 4.3}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Nutritional balance</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Taste & Flavor
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-extrabold text-brand-600">
              {feedbackStats?.avgTaste ?? 4.5}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Student taste rating</p>
        </Card>

        <Card className="p-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase">
            Mess Cleanliness
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-2xl font-extrabold text-indigo-600">
              {feedbackStats?.avgCleanliness ?? 4.6}
            </span>
            <span className="text-xs text-slate-400">/ 5.0</span>
          </div>
          <p className="text-[10px] text-slate-500 mt-0.5">Kitchen & hall hygiene</p>
        </Card>
      </div>

      {/* Menu Builder Form */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex-1 max-w-md">
            <Input
              label="Menu Schedule Title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>
          <Badge variant="success">Published Menu</Badge>
        </CardHeader>

        <CardContent className="p-4 space-y-4">
          {/* Day selection pills */}
          <div className="flex gap-2 overflow-x-auto pb-1">
            {days.map((day) => (
              <button
                key={day}
                type="button"
                onClick={() => setActiveDay(day)}
                className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition ${
                  activeDay === day
                    ? "bg-brand-600 text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                {day}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Breakfast (7:30 AM – 9:30 AM)
              </label>
              <textarea
                rows={3}
                value={schedule[activeDay]?.breakfast || ""}
                onChange={(e) => handleMealChange("breakfast", e.target.value)}
                placeholder="Items served for breakfast..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Lunch (12:30 PM – 2:30 PM)
              </label>
              <textarea
                rows={3}
                value={schedule[activeDay]?.lunch || ""}
                onChange={(e) => handleMealChange("lunch", e.target.value)}
                placeholder="Items served for lunch..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Evening Snacks (5:00 PM – 6:15 PM)
              </label>
              <textarea
                rows={3}
                value={schedule[activeDay]?.snacks || ""}
                onChange={(e) => handleMealChange("snacks", e.target.value)}
                placeholder="Items served for snacks..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>

            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-600 mb-1.5">
                Dinner (7:30 PM – 9:30 PM)
              </label>
              <textarea
                rows={3}
                value={schedule[activeDay]?.dinner || ""}
                onChange={(e) => handleMealChange("dinner", e.target.value)}
                placeholder="Items served for dinner..."
                className="w-full rounded-lg border border-slate-300 p-2.5 text-xs focus:outline-none focus:ring-2 focus:ring-brand-500"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Anonymous Student Comments Stream */}
      <Card>
        <CardHeader className="p-4 border-b border-slate-100 flex items-center justify-between">
          <CardTitle className="text-sm font-bold text-slate-800 flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-brand-600" />
            Recent Student Food Comments
          </CardTitle>
          <span className="text-[11px] text-slate-400">Anonymous Responses</span>
        </CardHeader>
        <CardContent className="p-4 divide-y divide-slate-100">
          {recentComments.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">
              No written student comments submitted yet.
            </p>
          ) : (
            recentComments.map((c) => (
              <div key={c.id} className="py-3 first:pt-0 last:pb-0">
                <div className="flex items-center justify-between text-xs mb-1">
                  <span className="font-bold text-slate-800">
                    {c.mealType} • {c.date}
                  </span>
                  <div className="flex gap-2 text-[11px] text-slate-500">
                    <span>Quality: <b>{c.ratings.foodQuality}/5</b></span>
                    <span>Taste: <b>{c.ratings.taste}/5</b></span>
                    <span>Cleanliness: <b>{c.ratings.cleanliness}/5</b></span>
                  </div>
                </div>
                <p className="text-xs text-slate-600 italic">"{c.comment}"</p>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  );
}
