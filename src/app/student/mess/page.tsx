"use client";

import React, { useState, useEffect } from "react";
import { UtensilsCrossed, Star, MessageSquarePlus, ChevronLeft, ChevronRight, CheckCircle2 } from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Modal } from "@/components/ui/modal";

const days = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"];

export default function StudentMessPage() {
  const [menuData, setMenuData] = useState<any>(null);
  const [activeDay, setActiveDay] = useState("monday");
  const [currentWeek, setCurrentWeek] = useState(41);
  const [currentYear, setCurrentYear] = useState(2026);
  const [isLoading, setIsLoading] = useState(true);

  // Feedback state
  const [isFeedbackOpen, setIsFeedbackOpen] = useState(false);
  const [feedbackMeal, setFeedbackMeal] = useState<"Breakfast" | "Lunch" | "Snacks" | "Dinner">("Lunch");
  const [ratings, setRatings] = useState({
    foodQuality: 5,
    taste: 5,
    cleanliness: 5,
  });
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [feedbackSuccess, setFeedbackSuccess] = useState("");
  const [feedbackError, setFeedbackError] = useState("");

  const fetchMenu = async (week: number, year: number) => {
    setIsLoading(true);
    try {
      const res = await fetch(`/api/mess-menu?week=${week}&year=${year}`);
      if (res.ok) {
        const data = await res.json();
        setMenuData(data.menu);
        setCurrentWeek(data.currentWeek);
        setCurrentYear(data.currentYear);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Determine today's day of week
    const dayNames = ["sunday", "monday", "tuesday", "wednesday", "thursday", "friday", "saturday"];
    const todayIndex = new Date().getDay();
    setActiveDay(dayNames[todayIndex]);
    fetchMenu(41, 2026);
  }, []);

  const handleFeedbackSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setFeedbackSuccess("");
    setFeedbackError("");

    const todayDate = new Date().toISOString().split("T")[0];

    try {
      const res = await fetch("/api/food-feedback", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          mealType: feedbackMeal,
          date: todayDate,
          ...ratings,
          comment,
        }),
      });

      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed to submit feedback");

      setFeedbackSuccess("Your feedback has been submitted. Thank you!");
      setTimeout(() => {
        setIsFeedbackOpen(false);
        setFeedbackSuccess("");
        setComment("");
      }, 1500);
    } catch (err: any) {
      setFeedbackError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  const schedule = menuData?.schedule || {};
  const currentDayMeals = schedule[activeDay] || {
    breakfast: "South Indian Idli, Sambar, Chutney & Tea/Coffee",
    lunch: "Jeera Rice, Dal Tadka, Paneer Butter Masala, Roti, Salad & Curd",
    snacks: "Veg Samosa with Mint Chutney & Masala Tea",
    dinner: "Veg Pulao, Chapati, Dal Makhani, Mixed Veg Curry & Gulab Jamun",
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-navy-950">Mess & Dining</h1>
          <p className="text-xs text-slate-500 mt-1">
            Weekly dining menu and student food quality feedback
          </p>
        </div>
        <Button
          onClick={() => setIsFeedbackOpen(true)}
          className="gap-2 shrink-0 bg-orange-600 hover:bg-orange-700 text-white"
        >
          <Star className="w-4 h-4" /> Rate Today's Food
        </Button>
      </div>

      {/* Week Title & Day Selector */}
      <Card className="p-4">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              {menuData?.title || "Hostel Regular Mess Schedule"}
            </h3>
            <p className="text-xs text-slate-400">Week {currentWeek}, {currentYear}</p>
          </div>
          <Badge variant="success">Active Weekly Menu</Badge>
        </div>

        {/* Days Pills */}
        <div className="flex gap-2 overflow-x-auto pt-3">
          {days.map((day) => (
            <button
              key={day}
              onClick={() => setActiveDay(day)}
              className={`px-4 py-2 rounded-xl text-xs font-bold capitalize whitespace-nowrap transition-all ${
                activeDay === day
                  ? "bg-brand-600 text-white shadow-sm"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {day}
            </button>
          ))}
        </div>
      </Card>

      {/* Meals Grid for Selected Day */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Breakfast */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="p-4 border-b border-slate-100 bg-amber-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-amber-800">
                Breakfast
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                7:30 AM – 9:30 AM
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-xs text-slate-700 leading-relaxed font-medium">
            {currentDayMeals.breakfast || "Standard Continental & Traditional Breakfast"}
          </CardContent>
        </Card>

        {/* Lunch */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="p-4 border-b border-slate-100 bg-emerald-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-800">
                Lunch
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                12:30 PM – 2:30 PM
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-xs text-slate-700 leading-relaxed font-medium">
            {currentDayMeals.lunch || "Standard Nutritious Lunch Buffet"}
          </CardContent>
        </Card>

        {/* Evening Snacks */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="p-4 border-b border-slate-100 bg-orange-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-orange-800">
                Evening Snacks
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                5:00 PM – 6:15 PM
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-xs text-slate-700 leading-relaxed font-medium">
            {currentDayMeals.snacks || "Hot Snacks & Tea/Coffee"}
          </CardContent>
        </Card>

        {/* Dinner */}
        <Card className="hover:border-slate-300 transition-colors">
          <CardHeader className="p-4 border-b border-slate-100 bg-indigo-50/50">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold uppercase tracking-wider text-indigo-800">
                Dinner
              </span>
              <span className="text-[10px] text-slate-400 font-semibold">
                7:30 PM – 9:30 PM
              </span>
            </div>
          </CardHeader>
          <CardContent className="p-4 text-xs text-slate-700 leading-relaxed font-medium">
            {currentDayMeals.dinner || "Wholesome Balanced Dinner & Dessert"}
          </CardContent>
        </Card>
      </div>

      {/* Food Feedback Modal */}
      <Modal
        isOpen={isFeedbackOpen}
        onClose={() => setIsFeedbackOpen(false)}
        title="Submit Food Feedback"
        description="Your anonymous rating helps the mess committee improve meal quality"
      >
        <form onSubmit={handleFeedbackSubmit} className="space-y-4">
          {feedbackError && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700">
              {feedbackError}
            </div>
          )}

          {feedbackSuccess && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>{feedbackSuccess}</span>
            </div>
          )}

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Select Meal
            </label>
            <select
              value={feedbackMeal}
              onChange={(e) => setFeedbackMeal(e.target.value as any)}
              className="w-full rounded-lg border border-slate-300 p-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-brand-500"
            >
              <option value="Breakfast">Breakfast</option>
              <option value="Lunch">Lunch</option>
              <option value="Snacks">Evening Snacks</option>
              <option value="Dinner">Dinner</option>
            </select>
          </div>

          {/* Star Ratings */}
          <div className="space-y-3 pt-2 border-t border-slate-100">
            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Food Quality</span>
                <span className="text-amber-600">{ratings.foodQuality} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={ratings.foodQuality}
                onChange={(e) =>
                  setRatings({ ...ratings, foodQuality: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Taste & Flavor</span>
                <span className="text-amber-600">{ratings.taste} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={ratings.taste}
                onChange={(e) =>
                  setRatings({ ...ratings, taste: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold text-slate-700 mb-1">
                <span>Mess Cleanliness & Hygiene</span>
                <span className="text-amber-600">{ratings.cleanliness} / 5</span>
              </div>
              <input
                type="range"
                min="1"
                max="5"
                value={ratings.cleanliness}
                onChange={(e) =>
                  setRatings({ ...ratings, cleanliness: parseInt(e.target.value, 10) })
                }
                className="w-full accent-amber-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1.5">
              Comments or Suggestions (Optional)
            </label>
            <textarea
              rows={3}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              placeholder="e.g. Sambar was great, could use less spice in the curry..."
              className="w-full rounded-lg border border-slate-300 p-2 text-sm focus:outline-none focus:ring-2 focus:ring-brand-500"
            />
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setIsFeedbackOpen(false)}
            >
              Cancel
            </Button>
            <Button type="submit" isLoading={isSubmitting}>
              Submit Feedback
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
