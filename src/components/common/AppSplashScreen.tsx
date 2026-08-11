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

    const hasShown = sessionStorage.getItem("ftt_splash_shown");
    if (hasShown === "true") {
      setIsVisible(false);
      return;
    }

    const interval = setInterval(() => {
      setProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          return 100;
        }
        return prev + 4;
      });
    }, 80);

    // Auto dismiss after 2.8 seconds to allow the book animation to play
    const timer = setTimeout(() => {
      setIsVisible(false);
      sessionStorage.setItem("ftt_splash_shown", "true");
    }, 2800);

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
          exit={{ opacity: 0, scale: 1.1 }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          onClick={handleDismiss}
          className="fixed inset-0 z-[99999] flex flex-col items-center justify-center bg-cream px-6 select-none cursor-pointer lg:hidden"
          aria-label="Opening app"
        >
          {/* Ambient Glow */}
          <div className="absolute h-96 w-96 rounded-full bg-gold/15 blur-3xl pointer-events-none" />

          {/* 3D Book Container */}
          <div className="relative flex flex-col items-center justify-center perspective-[1500px]">
            <motion.div
              initial={{ rotateX: 10, rotateY: -10 }}
              animate={{ rotateX: 0, rotateY: 0 }}
              transition={{ duration: 1.5, ease: "easeOut" }}
              className="relative w-48 h-64 md:w-56 md:h-72"
              style={{ transformStyle: "preserve-3d" }}
            >
              {/* Back Cover / Inside Pages */}
              <div 
                className="absolute inset-0 bg-[#FAF8F2] rounded-r-md shadow-2xl border-y border-r border-sand/40 flex flex-col items-center justify-center overflow-hidden"
              >
                {/* Page lines effect on the right edge */}
                <div className="absolute right-0 inset-y-0 w-3 bg-gradient-to-l from-black/5 to-transparent border-l border-sand/20" />
                
                {/* Inside Content (Revealed when opened) */}
                <motion.div 
                  initial={{ opacity: 0, scale: 0.9 }} 
                  animate={{ opacity: 1, scale: 1 }} 
                  transition={{ delay: 1.1, duration: 0.6, ease: "easeOut" }}
                  className="flex flex-col items-center z-10"
                >
                  <div className="relative w-16 h-16 mb-4">
                    <Image
                      src="/logo.png"
                      alt="For The Truth"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                  <h1 className="font-display text-lg font-bold tracking-[0.2em] text-charcoal uppercase text-center leading-tight">
                    For The<br />Truth
                  </h1>
                </motion.div>
              </div>

              {/* Front Cover */}
              <motion.div
                className="absolute inset-0 origin-left z-20"
                initial={{ rotateY: 0 }}
                animate={{ rotateY: -155 }}
                transition={{ duration: 1.4, delay: 0.5, ease: [0.25, 1, 0.5, 1] }}
                style={{ transformStyle: "preserve-3d" }}
              >
                {/* Front side of the cover */}
                <div 
                  className="absolute inset-0 rounded-r-md bg-navy shadow-[2px_0_10px_rgba(0,0,0,0.3)] border-l-[6px] border-gold-dark flex items-center justify-center"
                  style={{ backfaceVisibility: "hidden", WebkitBackfaceVisibility: "hidden" }}
                >
                  {/* Gold Foil Border */}
                  <div className="absolute inset-3 border border-gold/40 rounded-sm" />
                  <div className="absolute inset-4 border border-gold/20 rounded-sm" />
                  
                  {/* Cover Logo */}
                  <div className="relative w-20 h-20 opacity-90 drop-shadow-[0_2px_4px_rgba(0,0,0,0.5)]">
                    <Image
                      src="/logo.png"
                      alt="Cover Logo"
                      fill
                      className="object-contain"
                      priority
                    />
                  </div>
                </div>

                {/* Back side of the front cover (Inside Cover) */}
                <div 
                  className="absolute inset-0 rounded-l-md bg-cream border-l border-sand/30 shadow-inner"
                  style={{ 
                    backfaceVisibility: "hidden", 
                    WebkitBackfaceVisibility: "hidden", 
                    transform: "rotateY(180deg)" 
                  }}
                >
                  {/* Binding crease shadow */}
                  <div className="absolute left-0 inset-y-0 w-6 bg-gradient-to-r from-black/10 to-transparent" />
                </div>
              </motion.div>
            </motion.div>
          </div>

          {/* Minimalist Golden Progress Line */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.2, duration: 0.8 }}
            className="absolute bottom-16 flex flex-col items-center gap-3 w-full"
          >
            <div className="h-1 w-40 overflow-hidden rounded-full bg-sand/60">
              <div
                className="h-full bg-gold-gradient transition-all duration-100 ease-linear"
                style={{ width: `${progress}%` }}
              />
            </div>
            <span className="text-[10px] font-semibold tracking-[0.2em] text-charcoal/40 uppercase">
              Tap to open
            </span>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
