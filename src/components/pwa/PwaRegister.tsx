"use client";

import React, { useEffect, useState } from "react";
import Image from "next/image";
import { Download, X, Smartphone, Share } from "lucide-react";

export function PwaRegister() {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [showInstallBanner, setShowInstallBanner] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [isStandalone, setIsStandalone] = useState(false);
  const [showIosTip, setShowIosTip] = useState(false);

  useEffect(() => {
    // 1. Register Service Worker
    if (typeof window !== "undefined" && "serviceWorker" in navigator) {
      window.addEventListener("load", () => {
        navigator.serviceWorker
          .register("/sw.js")
          .then((reg) => {
            console.log("[PWA] Service Worker registered successfully:", reg.scope);
          })
          .catch((err) => {
            console.warn("[PWA] Service Worker registration failed:", err);
          });
      });
    }

    // 2. Check if already running as installed standalone app
    const isStandaloneMode =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as any).standalone === true;
    setIsStandalone(isStandaloneMode);

    // 3. Detect iOS Safari
    const userAgent = window.navigator.userAgent.toLowerCase();
    const isIosDevice = /iphone|ipad|ipod/.test(userAgent);
    setIsIOS(isIosDevice);

    // 4. Handle Chrome/Edge/Android beforeinstallprompt
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      // Only show banner if user hasn't dismissed it in this session
      const dismissed = sessionStorage.getItem("pwa_install_dismissed");
      if (!dismissed && !isStandaloneMode) {
        setShowInstallBanner(true);
      }
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);

    window.addEventListener("appinstalled", () => {
      console.log("[PWA] App successfully installed on device!");
      setShowInstallBanner(false);
      setDeferredPrompt(null);
    });

    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const choiceResult = await deferredPrompt.userChoice;
      if (choiceResult.outcome === "accepted") {
        console.log("[PWA] User accepted the install prompt");
        setShowInstallBanner(false);
      }
      setDeferredPrompt(null);
    } else if (isIOS) {
      setShowIosTip(true);
    }
  };

  const handleDismiss = () => {
    setShowInstallBanner(false);
    setShowIosTip(false);
    sessionStorage.setItem("pwa_install_dismissed", "true");
  };

  if (isStandalone) {
    return null;
  }

  return (
    <>
      {/* Sleek Floating Install Toast / Banner for Android & Desktop Chrome */}
      {showInstallBanner && deferredPrompt && (
        <aside
          role="region"
          aria-label="Install application prompt"
          className="fixed bottom-[calc(4.75rem+env(safe-area-inset-bottom,0px))] md:bottom-6 right-3 left-3 sm:left-auto sm:right-6 sm:max-w-sm max-w-[calc(100vw-1.5rem)] z-50 bg-navy-950 text-white rounded-2xl p-4 shadow-2xl border border-navy-800 animate-in slide-in-from-bottom duration-300 ring-1 ring-white/10"
        >
          <div className="flex items-start gap-3">
            <div className="h-10 w-10 rounded-xl bg-white p-1 flex items-center justify-center shrink-0 shadow-sm overflow-hidden">
              <Image
                src="/icons/icon-96x96.png"
                alt="HostelHub"
                width={36}
                height={36}
                className="h-full w-full object-contain"
              />
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-bold text-white leading-tight">Install HostelHub App</h4>
              <p className="text-xs text-slate-300 mt-0.5 leading-snug">
                Add to your home screen for fast fullscreen access and notifications.
              </p>
              <div className="flex items-center gap-2 mt-3">
                <button
                  onClick={handleInstallClick}
                  className="bg-brand-600 hover:bg-brand-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg transition-colors flex items-center gap-1.5 shadow-sm active:scale-95"
                >
                  <Download className="w-3.5 h-3.5" />
                  Install Now
                </button>
                <button
                  onClick={handleDismiss}
                  className="text-xs text-slate-400 hover:text-white px-2.5 py-1.5 rounded-lg transition"
                >
                  Not Now
                </button>
              </div>
            </div>
            <button
              onClick={handleDismiss}
              className="text-slate-400 hover:text-white p-1 rounded-lg"
              aria-label="Close"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </aside>
      )}

      {/* iOS Safari Instruction Modal */}
      {showIosTip && (
        <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-slate-950/60 backdrop-blur-sm animate-in fade-in">
          <div className="bg-white rounded-2xl p-5 max-w-sm w-full text-slate-800 shadow-2xl border border-slate-200">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2 font-bold text-navy-950 text-sm">
                <Smartphone className="w-4 h-4 text-brand-600" />
                Install on iPhone / iPad
              </div>
              <button onClick={() => setShowIosTip(false)} className="text-slate-400 hover:text-slate-700">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="py-4 space-y-3 text-xs text-slate-600">
              <p>Apple Safari requires manual installation to your home screen:</p>
              <ol className="list-decimal list-inside space-y-2 font-medium text-slate-800 bg-slate-50 p-3 rounded-xl border border-slate-100">
                <li className="flex items-center gap-2">
                  <span>1. Tap the</span>
                  <span className="inline-flex items-center gap-1 bg-white px-1.5 py-0.5 rounded border border-slate-200 font-bold text-brand-700">
                    <Share className="w-3.5 h-3.5" /> Share
                  </span>
                  <span>icon below</span>
                </li>
                <li>2. Scroll down and tap <strong>&quot;Add to Home Screen&quot;</strong></li>
                <li>3. Tap <strong>&quot;Add&quot;</strong> in the top right</li>
              </ol>
            </div>
            <button
              onClick={() => setShowIosTip(false)}
              className="w-full bg-navy-950 text-white font-bold text-xs py-2.5 rounded-xl hover:bg-navy-900 transition"
            >
              Got it
            </button>
          </div>
        </div>
      )}
    </>
  );
}

export default PwaRegister;
