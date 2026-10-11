import React from "react";
import Image from "next/image";

export default function RootLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-4">
      <div className="flex flex-col items-center gap-4">
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl bg-white flex items-center justify-center shadow-xl shadow-brand-500/15 border border-slate-200/80 p-2 animate-bounce ring-4 ring-brand-50">
            <Image
              src="/logo.png"
              alt="Bannari Amman Institute of Technology"
              width={54}
              height={44}
              className="object-contain"
              priority
            />
          </div>
          <div className="absolute -inset-1 rounded-2xl bg-brand-400/20 blur-sm animate-pulse -z-10" />
        </div>
        <div className="text-center space-y-1">
          <p className="text-sm font-black text-navy-950 tracking-tight">
            Hostel<span className="text-brand-600">Hub</span>
          </p>
          <p className="text-xs text-slate-400 font-medium">Bannari Amman Institute of Technology &bull; Loading records...</p>
        </div>
      </div>
    </div>
  );
}
