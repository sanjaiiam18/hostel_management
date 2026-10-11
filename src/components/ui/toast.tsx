"use client";

import React, { createContext, useContext, useState, useCallback } from "react";
import { CheckCircle2, AlertCircle, Info, X, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

type ToastType = "success" | "error" | "info" | "warning";

interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  message?: string;
}

interface ToastContextType {
  toast: (options: { type?: ToastType; title: string; message?: string }) => void;
  success: (title: string, message?: string) => void;
  error: (title: string, message?: string) => void;
  info: (title: string, message?: string) => void;
  warning: (title: string, message?: string) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const addToast = useCallback(
    ({ type = "info", title, message }: { type?: ToastType; title: string; message?: string }) => {
      const id = Math.random().toString(36).substring(2, 9);
      setToasts((prev) => [...prev, { id, type, title, message }]);

      setTimeout(() => {
        removeToast(id);
      }, 4000);
    },
    [removeToast]
  );

  const contextValue: ToastContextType = {
    toast: addToast,
    success: (title, message) => addToast({ type: "success", title, message }),
    error: (title, message) => addToast({ type: "error", title, message }),
    info: (title, message) => addToast({ type: "info", title, message }),
    warning: (title, message) => addToast({ type: "warning", title, message }),
  };

  const getIcon = (type: ToastType) => {
    switch (type) {
      case "success":
        return <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />;
      case "error":
        return <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />;
      case "warning":
        return <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />;
      default:
        return <Info className="w-5 h-5 text-brand-500 shrink-0" />;
    }
  };

  const getBgStyle = (type: ToastType) => {
    switch (type) {
      case "success":
        return "border-emerald-200 bg-white shadow-emerald-500/10";
      case "error":
        return "border-rose-200 bg-white shadow-rose-500/10";
      case "warning":
        return "border-amber-200 bg-white shadow-amber-500/10";
      default:
        return "border-brand-200 bg-white shadow-brand-500/10";
    }
  };

  return (
    <ToastContext.Provider value={contextValue}>
      {children}
      {/* Toast container floating in bottom-right */}
      <div className="fixed bottom-5 right-5 z-50 flex flex-col gap-2.5 max-w-sm w-full pointer-events-none px-4 sm:px-0">
        {toasts.map((t) => (
          <div
            key={t.id}
            className={cn(
              "pointer-events-auto flex items-start gap-3 p-4 rounded-xl border shadow-lg transition-all duration-300 animate-in slide-in-from-bottom-5 fade-in",
              getBgStyle(t.type)
            )}
          >
            {getIcon(t.type)}
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-slate-900 leading-snug">{t.title}</p>
              {t.message && (
                <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{t.message}</p>
              )}
            </div>
            <button
              onClick={() => removeToast(t.id)}
              className="text-slate-400 hover:text-slate-600 transition p-0.5 rounded-md"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>
        ))}
      </div>
    </ToastContext.Provider>
  );
}

export function useToast() {
  const context = useContext(ToastContext);
  if (!context) {
    // Graceful fallback if not inside provider
    return {
      toast: console.log,
      success: console.log,
      error: console.error,
      info: console.log,
      warning: console.warn,
    };
  }
  return context;
}
