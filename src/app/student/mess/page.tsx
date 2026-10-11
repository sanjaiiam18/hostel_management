"use client";

import React, { useState, useEffect } from "react";
import {
  UtensilsCrossed,
  Star,
  MessageSquarePlus,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  Coffee,
  Sun,
  Cookie,
  Moon,
  Info,
  Clock,
  ThumbsUp,
  Sparkles,
  AlertCircle,
  ShieldCheck,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { CardSkeleton } from "@/components/ui/skeleton";
import { useToast } from "@/components/ui/toast";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function StudentMessPage() {
  const { success, error: toastError, info } = useToast();

  const [menuData, setMenuData] = useState<any>(null);
  const [activeDay, setActiveDay] = useState("monday");
  const [isLoading, setIsLoading] = useState(true);

  // Feedback modal state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMeal, setFeedbackMeal] = useState<"Breakfast" | "Lunch" | "Snacks" | "Dinner">("Lunch");
  const [ratings, setRatings] = useState({
    foodQuality: 4,
    taste: 4,
    cleanliness: 5,
  });
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchMenu = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/mess-menu");
      if (res.ok) {
        const data = await res.json();
        setMenuData(data.menu);
      }
    } catch (e) {
      console.error(e);
      toastError("Menu Load Failed", "Unable to load dining schedule.");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayIndex = new Date().getDay();
    setActiveDay(dayNames[todayIndex]);
    fetchMenu();
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    const todayDate = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("/api/food-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: feedbackMeal,
          date: todayDate,
          ...ratings,
          comment: comment.trim() || "Good meal today",
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      success("Rating Recorded!", `Your feedback for ${feedbackMeal} has been delivered to the Mess Committee.`);
      setIsFeedbackOpen(false);
      setComment("");
    } catch (err: any) {
      toastError("Submission Error", err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const schedule = menuData?.schedule || menuData?.weeklySchedule || {};
  const currentDayMeals = schedule[activeDay] || {
    breakfast: "South Indian Idli, Sambar, Coconut Chutney, Boiled Eggs & Tea/Coffee",
    lunch: "Jeera Rice, Yellow Dal Tadka, Paneer Butter Masala, Fresh Rotis, Boondi Raita & Salad",
    snacks: "Veg Samosa with Mint Green Chutney, Biscuits & Masala Chai",
    dinner: "Veg Pulao, Chapati, Dal Makhani, Aloo Gobi Curry, Gulab Jamun & Pickle",
  };

  const dayLabels: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thu",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
  };

  const todayDayName = new Date().toLocaleDateString("en-US", { weekday: "long" }).toLowerCase();

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-navy-950 tracking-tight">
            Dining Hall & Weekly Mess Menu
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            FSSAI Certified Central Dining Hall &bull; Nutritious 4-Meal Rotation for Spring 2026
          </p>
        </div>
        <Button
          onClick={() => {
            setFeedbackMeal("Lunch");
            setIsFeedbackOpen(true);
          }}
          size="sm"
          className="gap-2 shrink-0 font-bold"
        >
          <MessageSquarePlus className="w-4 h-4" /> Rate Today&apos;s Food
        </Button>
      </div>

      {/* Institutional Quality Certification Banner */}
      <div className="p-4 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-white border border-orange-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-orange-600 text-white shrink-0">
            <UtensilsCrossed className="w-5 h-5" />
          </div>
          <div>
            <p className="text-xs font-bold text-slate-900">
              Hostel Central Mess &bull; Clean Kitchen & Food Safety Standard
            </p>
            <p className="text-[11px] text-slate-600 mt-0.5">
              RO UV-filtered drinking water &bull; Unlimited salad bar during Lunch & Dinner &bull; Separate vegetarian counters
            </p>
          </div>
        </div>
        <Badge variant="success" className="self-start sm:self-auto font-bold">
          FSSAI Grade A
        </Badge>
      </div>

      {/* Interactive 7-Day Day Selector Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 p-1.5 bg-slate-100 rounded-2xl">
        {days.map((day) => {
          const isToday = day === todayDayName;
          const isActive = day === activeDay;
          return (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`flex-1 min-w-[70px] py-2 px-3 rounded-xl text-xs font-bold transition-all text-center cursor-pointer active:scale-95 ${
                isActive
                  ? "bg-white text-navy-950 shadow-sm border border-slate-200/80"
                  : "text-slate-600 hover:text-slate-900 hover:bg-white/50"
              }`}
            >
              <span className="capitalize block">{dayLabels[day]}</span>
              {isToday && (
                <span className="block text-[9px] font-black uppercase text-brand-600 mt-0.5 tracking-wider">
                  TODAY
                </span>
              )}
            </button>
          );
        })}
      </div>

      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <CardSkeleton key={i} lines={3} />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Breakfast */}
          <Card className="hover:shadow-md transition border-amber-200/70">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100 bg-amber-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-amber-100 text-amber-800 rounded-xl">
                  <Coffee className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Breakfast
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">07:30 AM &ndash; 09:15 AM</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedbackMeal("Breakfast");
                  setIsFeedbackOpen(true);
                }}
                className="text-[11px] font-bold text-amber-700 hover:underline"
              >
                Rate Meal &rarr;
              </button>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {currentDayMeals.breakfast}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Tea & Coffee</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Bread & Butter</span>
              </div>
            </CardContent>
          </Card>

          {/* Lunch */}
          <Card className="hover:shadow-md transition border-emerald-200/70">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100 bg-emerald-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-emerald-100 text-emerald-800 rounded-xl">
                  <Sun className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Lunch
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">12:30 PM &ndash; 02:15 PM</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedbackMeal("Lunch");
                  setIsFeedbackOpen(true);
                }}
                className="text-[11px] font-bold text-emerald-700 hover:underline"
              >
                Rate Meal &rarr;
              </button>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {currentDayMeals.lunch}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Fresh Curd / Raita</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Cucumber Salad</span>
              </div>
            </CardContent>
          </Card>

          {/* Evening Snacks */}
          <Card className="hover:shadow-md transition border-orange-200/70">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100 bg-orange-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-100 text-orange-800 rounded-xl">
                  <Cookie className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Evening High Tea
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">05:00 PM &ndash; 06:15 PM</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedbackMeal("Snacks");
                  setIsFeedbackOpen(true);
                }}
                className="text-[11px] font-bold text-orange-700 hover:underline"
              >
                Rate Meal &rarr;
              </button>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {currentDayMeals.snacks}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Ginger Masala Chai</span>
              </div>
            </CardContent>
          </Card>

          {/* Dinner */}
          <Card className="hover:shadow-md transition border-indigo-200/70">
            <CardHeader className="p-4 flex flex-row items-center justify-between border-b border-slate-100 bg-indigo-50/40">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-indigo-100 text-indigo-800 rounded-xl">
                  <Moon className="w-4 h-4" />
                </div>
                <div>
                  <CardTitle className="text-sm font-bold text-slate-800">
                    Dinner
                  </CardTitle>
                  <p className="text-[10px] text-slate-400 font-medium">07:45 PM &ndash; 09:30 PM</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setFeedbackMeal("Dinner");
                  setIsFeedbackOpen(true);
                }}
                className="text-[11px] font-bold text-indigo-700 hover:underline"
              >
                Rate Meal &rarr;
              </button>
            </CardHeader>
            <CardContent className="p-5">
              <p className="text-xs font-medium text-slate-800 leading-relaxed">
                {currentDayMeals.dinner}
              </p>
              <div className="mt-3 flex items-center gap-2 text-[10px] text-slate-400">
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Dessert Included</span>
                <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-600 font-semibold">Tawa Roti</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* FEEDBACK MODAL */}
      <Modal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title={`Student Dining Feedback &bull; ${feedbackMeal}`}
        description="Your anonymous rating directly determines the monthly catering vendor performance score."
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 mb-1">Select Meal</label>
            <select
              value={feedbackMeal}
              onChange={(e: any) => setFeedbackMeal(e.target.value)}
              className="w-full text-xs h-9 rounded-lg border border-slate-300 px-3 bg-white"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snacks">Evening Snacks</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          <div className="space-y-3 p-3.5 rounded-xl bg-slate-50 border border-slate-200">
            {/* Food Quality */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Food Freshness & Quality</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatings({ ...ratings, foodQuality: star })}
                    className="p-0.5 text-slate-300 hover:text-amber-400 focus:outline-none transition active:scale-125"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratings.foodQuality
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Taste */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Taste & Flavoring</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatings({ ...ratings, taste: star })}
                    className="p-0.5 text-slate-300 hover:text-amber-400 focus:outline-none transition active:scale-125"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratings.taste
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>

            {/* Cleanliness */}
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-700">Utensil & Dining Hygiene</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <button
                    key={star}
                    type="button"
                    onClick={() => setRatings({ ...ratings, cleanliness: star })}
                    className="p-0.5 text-slate-300 hover:text-amber-400 focus:outline-none transition active:scale-125"
                  >
                    <Star
                      className={`w-4 h-4 ${
                        star <= ratings.cleanliness
                          ? "fill-amber-400 text-amber-400"
                          : "text-slate-300"
                      }`}
                    />
                  </button>
                ))}
              </div>
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Comments or Suggested Improvements
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Sambar was delicious, rotis were soft and served warm..."
              className="w-full text-xs rounded-lg border border-slate-300 p-2.5 focus:ring-2 focus:ring-brand-500 focus:outline-none"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setIsFeedbackOpen(false)}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              variant="primary"
              size="sm"
              isLoading={isSubmitting}
            >
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
