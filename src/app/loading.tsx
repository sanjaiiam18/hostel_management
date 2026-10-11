import React from "react";
import { Building2 } from "lucide-react";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-14 w-14 rounded-2xl bg-gradient-to-tr from-brand-700 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-brand-500/25 animate-bounce">
            <Building2 className="w-7 h-7" />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-brand-400/30 blur-sm animate-pulse -z-10" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-black text-navy-950 tracking-tight">
            Hostel<span className="text-brand-600">Hub</span>
          </p>
          <p className="text-xs text-slate-400 font-medium">Synchronizing campus records...</p>
        </div>
      </div>
    </div>
  );
}
