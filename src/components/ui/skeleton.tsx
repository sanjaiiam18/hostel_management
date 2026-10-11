import React from "react";
import { cn } from "@/lib/utils";

export interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  className?: string;
}

export function Skeleton({ className, ...props }: SkeletonProps) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-lg bg-slate-200/70 dark:bg-slate-800",
        "before:absolute before:inset-0 before:-translate-x-full before:animate-[shimmer_1.6s_infinite]",
        "before:bg-gradient-to-r before:from-transparent before:via-white/60 before:to-transparent",
        className
      )}
      {...props}
    />
  );
}

export function StatCardSkeleton() {
  return (
    <div className="p-5 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-3">
      <div className="flex items-center justify-between">
        <Skeleton className="h-4 w-28 rounded-md" />
        <Skeleton className="h-9 w-9 rounded-xl" />
      </div>
      <Skeleton className="h-8 w-20 rounded-md" />
      <div className="flex items-center gap-2 pt-1">
        <Skeleton className="h-3 w-16 rounded-md" />
        <Skeleton className="h-3 w-24 rounded-md" />
      </div>
    </div>
  );
}

export function CardSkeleton({ lines = 3 }: { lines?: number }) {
  return (
    <div className="p-6 rounded-2xl bg-white border border-slate-200/80 shadow-xs space-y-4">
      <div className="flex items-center justify-between">
        <Skeleton className="h-5 w-36 rounded-md" />
        <Skeleton className="h-4 w-16 rounded-md" />
      </div>
      <div className="space-y-2.5 pt-2">
        {Array.from({ length: lines }).map((_, i) => (
          <Skeleton
            key={i}
            className="h-3.5 rounded-md"
            style={{ width: `${85 - i * 15}%` }}
          />
        ))}
      </div>
    </div>
  );
}

export function TableSkeleton({ rows = 5, cols = 4 }: { rows?: number; cols?: number }) {
  return (
    <div className="rounded-2xl bg-white border border-slate-200/80 shadow-xs overflow-hidden">
      <div className="p-4 border-b border-slate-100 flex items-center justify-between gap-4">
        <Skeleton className="h-5 w-40 rounded-md" />
        <Skeleton className="h-8 w-60 rounded-lg" />
      </div>
      <div className="divide-y divide-slate-100">
        {Array.from({ length: rows }).map((_, r) => (
          <div key={r} className="p-4 flex items-center justify-between gap-4">
            {Array.from({ length: cols }).map((_, c) => (
              <Skeleton
                key={c}
                className="h-4 rounded-md"
                style={{ width: `${15 + ((r + c) % 3) * 10}%` }}
              />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function ProfileBannerSkeleton() {
  return (
    <div className="p-6 sm:p-8 rounded-2xl bg-navy-950/80 border border-navy-900 shadow-lg space-y-4">
      <div className="flex items-center gap-4">
        <Skeleton className="h-16 w-16 rounded-2xl bg-navy-800" />
        <div className="space-y-2">
          <Skeleton className="h-6 w-48 rounded-md bg-navy-800" />
          <Skeleton className="h-4 w-64 rounded-md bg-navy-800" />
        </div>
      </div>
    </div>
  );
}

export default Skeleton;
