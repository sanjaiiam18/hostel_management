import React from "react";
import { Skeleton, StatCardSkeleton, CardSkeleton } from "@/components/ui/skeleton";

export default function StudentLoading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Hero Welcome Banner Skeleton */}
      <div className="p-6 sm:p-8 rounded-2xl bg-navy-950 border border-navy-900 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <Skeleton className="h-16 w-16 rounded-2xl bg-navy-800" />
            <div className="space-y-2">
              <Skeleton className="h-6 w-52 rounded-md bg-navy-800" />
              <Skeleton className="h-4 w-72 rounded-md bg-navy-800" />
            </div>
          </div>
          <Skeleton className="h-14 w-60 rounded-xl bg-navy-800" />
        </div>
      </div>

      {/* Quick Actions Grid Skeleton */}
      <div className="space-y-3">
        <Skeleton className="h-4 w-28 rounded-md" />
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-20 rounded-xl" />
          ))}
        </div>
      </div>

      {/* Key Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {Array.from({ length: 4 }).map((_, i) => (
          <StatCardSkeleton key={i} />
        ))}
      </div>

      {/* Content Split Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <CardSkeleton lines={4} />
        <CardSkeleton lines={4} />
      </div>
    </div>
  );
}
