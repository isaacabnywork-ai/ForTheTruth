"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { motion, AnimatePresence } from "framer-motion";

export function AppSplashScreen() {
  const [isVisible, setIsVisible] = useState<boolean>(true);
  const [isMounted, setIsMounted] = useState<boolean>(false);
  const [progress, setProgress] = useState<number>(0);

  useEffect(() => {
    setIsMounted(true);

    // Check if splash was already shown in this session
    const hasShown = sessionStorage.getItem("ftt_splash_shown");
    if (hasShown === "true") {
      setIsVisible(false);
      return;
    }

    // Animate progress bar from 0 to 100 over 1.8 seconds
    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 5;
      });
    }, 80);

    // Auto dismiss after 2.2 seconds
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("ftt_splash_shown", "true");
    }, 2200);

    return () => {
      clearInterval(interval);
      clearTimeout(timer);
    };
  }, []);

  const handleDismiss = () => {
    setIsVisible(false);
    sessionStorage.setItem("ftt_splash_shown", "true");
  };

  if (!isMounted) return null;

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0, scale: 1.05 }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-[#FAF6F0] px-6 select-none cursor-pointer lg:hidden"
          aria-label="Opening app"
        >
          {/* Ambient Warm Golden Background Glow */}
          <div className="absolute h-96 w-96 rounded-full bg-gold/15 blur-3xl pointer-events-none" />

          {/* Central Logo Container with Multi-layered Orbiting Rings */}
          <div className="relative flex items-center justify-center w-48 h-48">
            
            {/* Outer Spinning Conic Gradient Ring */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 4, ease: "linear" }}
              className="absolute inset-0 rounded-full p-[2px] bg-gradient-to-r from-gold via-sand to-gold-dark shadow-lg opacity-80"
              style={{
                maskImage: "radial-gradient(circle, transparent 62%, black 65%)",
                WebkitMaskImage: "radial-gradient(circle, transparent 62%, black 65%)",
              }}
            />

            {/* Counter-Rotating Dashed Orbit Ring */}
            <motion.div
              animate={{ rotate: -360 }}
              transition={{ repeat: Infinity, duration: 7, ease: "linear" }}
              className="absolute inset-2 rounded-full border-2 border-dashed border-gold/40"
            />

            {/* Pulsing Aura Ring */}
            <motion.div
              animate={{ scale: [1, 1.15, 1], opacity: [0.3, 0.7, 0.3] }}
              transition={{ repeat: Infinity, duration: 2.2, ease: "easeInOut" }}
              className="absolute inset-4 rounded-full border border-gold/30 bg-gold/5"
            />

            {/* Orbiting Golden Light Node */}
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ repeat: Infinity, duration: 3, ease: "easeInOut" }}
              className="absolute inset-0 flex items-start justify-center"
            >
              <div className="h-3 w-3 -mt-1.5 rounded-full bg-gold shadow-[0_0_12px_#C89B3C]" />
            </motion.div>

            {/* Inner White Badge for Logo */}
            <motion.div
              initial={{ scale: 0.7, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
              className="relative z-10 flex h-28 w-28 items-center justify-center rounded-full bg-white shadow-xl border border-sand/80 p-4"
            >
              <Image
                src="/logo.png"
                alt="For The Truth"
                width={80}
                height={80}
                className="object-contain drop-shadow-sm"
                priority
              />
            </motion.div>
          </div>

          {/* Brand Name & Subtitle Animation */}
          <motion.div
            initial={{ y: 15, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.25, duration: 0.6, ease: "easeOut" }}
            className="mt-8 text-center"
          >
            <h1 className="font-display text-2xl font-bold tracking-[0.25em] text-charcoal uppercase">
              For The Truth
            </h1>
            <p className="mt-1.5 text-xs font-semibold tracking-widest text-gold-dark uppercase opacity-85">
              Christian Bookstore & Resources
            </p>
          </motion.div>

          {/* Minimalist Golden Progress Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
            className="mt-8 flex flex-col items-center gap-2"
          >
            <div className="h-1 w-36 overflow-hidden rounded-full bg-sand/60">
              <div
                className="h-full bg-gold-gradient transition-all duration-150 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-medium tracking-wider text-charcoal/40 uppercase">
              Tap anywhere to skip
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
