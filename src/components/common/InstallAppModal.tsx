"use client";

import { useState, useEffect } from "react";
import Image from "next/image";

interface BeforeInstallPromptEvent extends Event {
  readonly platforms: string[];
  readonly userChoice: Promise<{
    outcome: "accepted" | "dismissed";
    platform: string;
  }>;
  prompt(): Promise<void>;
}

export function InstallAppModal() {
  const [showModal, setShowModal] = useState(false);
  const [isIOS, setIsIOS] = useState(false);
  const [promptEvent, setPromptEvent] = useState<BeforeInstallPromptEvent | null>(null);

  useEffect(() => {
    // 1. Do not show if app is already running in standalone installed mode
    const isStandalone =
      window.matchMedia("(display-mode: standalone)").matches ||
      (window.navigator as unknown as { standalone?: boolean }).standalone === true;

    if (isStandalone) return;

    // 2. Do not show if user previously dismissed within the last 5 days
    const dismissed = localStorage.getItem("ftt_app_install_dismissed");
    if (dismissed && Date.now() - Number(dismissed) < 1000 * 60 * 60 * 24 * 5) {
      return;
    }

    // 3. Detect iOS devices (iPhone, iPad, iPod)
    const ua = window.navigator.userAgent.toLowerCase();
    const isIOSDevice =
      /iphone|ipad|ipod/.test(ua) ||
      (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);

    if (isIOSDevice) {
      setIsIOS(true);
      const timer = setTimeout(() => setShowModal(true), 3000);
      return () => clearTimeout(timer);
    }

    // 4. Handle Android / Chrome beforeinstallprompt event
    const handleBeforeInstallPrompt = (e: Event) => {
      e.preventDefault();
      const installEvent = e as BeforeInstallPromptEvent;
      setPromptEvent(installEvent);
      setTimeout(() => setShowModal(true), 2500);
    };

    window.addEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    return () => {
      window.removeEventListener("beforeinstallprompt", handleBeforeInstallPrompt);
    };
  }, []);

  const handleDismiss = () => {
    setShowModal(false);
    localStorage.setItem("ftt_app_install_dismissed", Date.now().toString());
  };

  const handleInstallClick = async () => {
    if (!promptEvent) return;
    await promptEvent.prompt();
    const { outcome } = await promptEvent.userChoice;
    if (outcome === "accepted") {
      setShowModal(false);
      localStorage.setItem("ftt_app_install_dismissed", Date.now().toString());
    }
  };

  if (!showModal) return null;

  return (
    <div className="fixed inset-x-3 bottom-20 z-[70] mx-auto max-w-sm rounded-2xl border border-gold/40 bg-white/95 p-4.5 shadow-[0_15px_40px_-10px_rgba(120,85,30,0.3)] backdrop-blur-xl transition-all duration-500 sm:bottom-6 sm:left-auto sm:right-6 sm:max-w-md sm:p-5">
      {/* Header & Logo */}
      <div className="flex items-start justify-between gap-3 border-b border-sand pb-3">
        <div className="flex items-center gap-3">
          <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-xl border border-sand bg-cream p-1 shadow-xs">
            <Image src="/logo.png" alt="For The Truth Logo" fill className="object-contain p-0.5" />
          </div>
          <div>
            <h3 className="font-display text-base font-bold text-charcoal">For The Truth App</h3>
            <p className="text-[11px] font-medium uppercase tracking-wider text-gold-dark">
              Official Mobile Store
            </p>
          </div>
        </div>
        <button
          onClick={handleDismiss}
          aria-label="Close installation prompt"
          className="flex h-7 w-7 items-center justify-center rounded-full bg-cream text-charcoal/60 hover:bg-sand/60 hover:text-charcoal transition-smooth"
        >
          ✕
        </button>
      </div>

      {/* Content */}
      <div className="mt-3.5">
        <p className="text-xs text-charcoal/80 leading-relaxed">
          Install our web app on your phone for lightning-fast loading, full offline caching, and direct 1-tap access to trusted Christian books!
        </p>

        {isIOS ? (
          <div className="mt-3 rounded-xl border border-sand bg-cream/70 p-3 text-xs text-charcoal space-y-2">
            <p className="font-bold text-charcoal">To install on iPhone or iPad:</p>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-bold text-gold-dark shadow-xs">
                1
              </span>
              <span>
                Tap the <strong className="font-semibold text-charcoal">Share button 📤</strong> in your browser menu.
              </span>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-white font-bold text-gold-dark shadow-xs">
                2
              </span>
              <span>
                Select <strong className="font-semibold text-charcoal">Add to Home Screen ➕</strong> below.
              </span>
            </div>
          </div>
        ) : (
          <div className="mt-4 flex flex-col gap-2">
            <button
              onClick={handleInstallClick}
              className="w-full rounded-full bg-gold-gradient py-2.5 text-center text-xs sm:text-sm font-bold tracking-wide text-white shadow-gold transition-transform active:scale-95"
            >
              📲 Install App Shortcut
            </button>
            <button
              onClick={handleDismiss}
              className="w-full text-center text-xs font-semibold text-charcoal/60 py-1 hover:text-charcoal"
            >
              Maybe later
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
