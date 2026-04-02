"use client";

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { WifiOff, Wifi } from "lucide-react";

export function OfflineBanner() {
  const [isOnline, setIsOnline] = useState(true);
  const [showRecovered, setShowRecovered] = useState(false);

  useEffect(() => {
    setIsOnline(navigator.onLine);

    const handleOnline = () => {
      setIsOnline(true);
      setShowRecovered(true);
      setTimeout(() => setShowRecovered(false), 3000);
    };
    const handleOffline = () => {
      setIsOnline(false);
      setShowRecovered(false);
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);
    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return (
    <AnimatePresence>
      {!isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-[#F4C95D] px-4 py-2 text-center"
        >
          <p className="text-sm font-medium text-[#2F2F2F] flex items-center justify-center gap-2">
            <WifiOff size={14} />
            You&apos;re offline — Panda chat needs internet, but you can still browse your progress and lessons!
          </p>
        </motion.div>
      )}
      {showRecovered && isOnline && (
        <motion.div
          initial={{ y: -50, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: -50, opacity: 0 }}
          className="fixed top-0 left-0 right-0 z-[200] bg-[#DDEED5] px-4 py-2 text-center"
        >
          <p className="text-sm font-medium text-[#4F7C57] flex items-center justify-center gap-2">
            <Wifi size={14} />
            Back online! Panda is ready to chat again.
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
