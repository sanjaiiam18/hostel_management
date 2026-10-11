"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Building2, Eye, EyeOff, Lock, User as UserIcon, Shield, Sparkles, ArrowRight, Loader2 } from "lucide-react";
import { Logo } from "@/components/ui/logo";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e?: React.FormEvent, customIdent?: string, customPass?: string) => {
    if (e) e.preventDefault();
    setIsLoading(true);
    setError("");

    const id = customIdent || identifier;
    const pwd = customPass || password;

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier: id, password: pwd }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Login failed");
      }

      // Determine redirection based on authenticated user's role from server
      if (data.user.role === "admin" || data.user.role === "warden") {
        router.push("/admin/dashboard");
      } else {
        router.push("/student/dashboard");
      }
      router.refresh();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  // Instant 1-Click Demo Logins for fast evaluation
  const handleQuickDemoLogin = (type: "admin" | "student") => {
    const id = type === "admin" ? "admin@hostelhub.edu" : "student1@hostelhub.edu";
    const pwd = type === "admin" ? "Admin@123" : "Student@123";
    setIdentifier(id);
    setPassword(pwd);
    handleLogin(undefined, id, pwd);
  };

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <Link href="/" className="inline-block hover:scale-105 transition-transform mb-3">
          <Logo size="xl" imageOnly />
        </Link>
        <h2 className="text-3xl font-black text-navy-950 tracking-tight">
          Hostel<span className="text-brand-600">Hub</span>
        </h2>
        <p className="mt-1 text-xs text-slate-500 font-medium">
          Bannari Amman Institute of Technology &bull; Residential Life Portal
        </p>
      </div>

      <div className="mt-7 sm:mx-auto sm:w-full sm:max-w-md px-4 sm:px-0">
        <div className="bg-white py-8 px-6 sm:px-10 shadow-xl rounded-2xl border border-slate-200/80">
          <form className="space-y-4" onSubmit={(e) => handleLogin(e)}>
            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-semibold animate-in fade-in">
                {error}
              </div>
            )}

            <div>
              <Input
                label="Email or Student Roll ID"
                id="identifier"
                type="text"
                value={identifier}
                onChange={(e) => setIdentifier(e.target.value)}
                placeholder="e.g. STU-2026-001 or admin@hostelhub.edu"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 mb-1.5">
                Password
              </label>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-2.5 text-slate-400 hover:text-slate-600"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs pt-1">
              <label className="flex items-center gap-2 text-slate-600 cursor-pointer select-none">
                <input
                  type="checkbox"
                  className="rounded border-slate-300 text-brand-600 focus:ring-brand-500"
                  defaultChecked
                />
                Remember me
              </label>
              <Link
                href="/forgot-password"
                className="text-brand-600 hover:text-brand-700 font-semibold"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full h-11 text-xs sm:text-sm font-bold shadow-md shadow-brand-500/20"
              isLoading={isLoading}
            >
              Sign In to Residence Portal
            </Button>
          </form>

          {/* Quick Review Demo Accounts (Instant 1-Click login) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest text-center mb-2.5">
              Instant 1-Click Institutional Demo
            </p>
            <div className="grid grid-cols-2 gap-2.5">
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemoLogin("student")}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-brand-200 bg-brand-50/50 hover:bg-brand-50 text-brand-800 text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <UserIcon className="w-3.5 h-3.5 text-brand-600" />
                Student Demo &rarr;
              </button>
              <button
                type="button"
                disabled={isLoading}
                onClick={() => handleQuickDemoLogin("admin")}
                className="flex items-center justify-center gap-1.5 px-3 py-2.5 rounded-xl border border-navy-200 bg-navy-50/60 hover:bg-navy-100 text-navy-900 text-xs font-bold transition active:scale-95 cursor-pointer disabled:opacity-50"
              >
                <Shield className="w-3.5 h-3.5 text-navy-800" />
                Warden Demo &rarr;
              </button>
            </div>
          </div>

          <div className="mt-5 text-center">
            <p className="text-xs text-slate-600">
              New residential student?{" "}
              <Link
                href="/register"
                className="font-bold text-brand-600 hover:text-brand-700"
              >
                Submit registration &rarr;
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
