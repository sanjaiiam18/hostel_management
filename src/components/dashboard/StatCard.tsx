import React from "react";
import { LucideIcon } from "lucide-react";
import { Card } from "@/components/ui/card";
import { cn } from "@/lib/utils";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  description?: string;
  trend?: string;
  trendType?: "positive" | "negative" | "neutral";
  colorClass?: string;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  description,
  trend,
  trendType = "neutral",
  colorClass = "bg-brand-50 text-brand-600",
}: StatCardProps) {
  return (
    <Card className="p-3.5 sm:p-5 hover:shadow-md transition-shadow duration-200 border-slate-200/80 bg-white">
      <div className="flex items-center justify-between gap-1.5 min-w-0">
        <p className="text-[11px] sm:text-xs font-semibold uppercase tracking-wider text-slate-500 truncate">
          {title}
        </p>
        <div className={cn("p-1.5 sm:p-2 rounded-xl shrink-0", colorClass)}>
          <Icon className="w-4 h-4 sm:w-5 sm:h-5" />
        </div>
      </div>

      <div className="mt-2 sm:mt-3">
        <h3 className="text-xl sm:text-2xl font-black tracking-tight text-slate-900">
          {value}
        </h3>
        {(description || trend) && (
          <div className="mt-1 flex items-center gap-1.5 text-[11px] sm:text-xs min-w-0">
            {trend && (
              <span
                className={cn(
                  "font-medium shrink-0",
                  trendType === "positive" && "text-emerald-600",
                  trendType === "negative" && "text-rose-600",
                  trendType === "neutral" && "text-slate-500"
                )}
              >
                {trend}
              </span>
            )}
            {description && (
              <span className="text-slate-400 truncate">{description}</span>
            )}
          </div>
        )}
      </div>
    </Card>
  );
}

export default StatCard;
