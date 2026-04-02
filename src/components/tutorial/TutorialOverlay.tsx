"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { ChevronRight, ChevronLeft, X, PartyPopper } from "lucide-react";

export type TutorialStep = {
  target: string; // CSS selector
  title: string;
  description: string;
  position?: "top" | "bottom" | "left" | "right";
};

type SpotlightRect = {
  top: number;
  left: number;
  width: number;
  height: number;
};

function getTooltipPosition(
  rect: SpotlightRect,
  position: string,
  windowWidth: number,
  windowHeight: number
) {
  const padding = 16;
  const tooltipWidth = 320;
  const tooltipHeight = 180;

  switch (position) {
    case "bottom":
      return {
        top: rect.top + rect.height + padding,
        left: Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, windowWidth - tooltipWidth - padding)),
      };
    case "top":
      return {
        top: rect.top - tooltipHeight - padding,
        left: Math.max(padding, Math.min(rect.left + rect.width / 2 - tooltipWidth / 2, windowWidth - tooltipWidth - padding)),
      };
    case "left":
      return {
        top: Math.max(padding, rect.top + rect.height / 2 - tooltipHeight / 2),
        left: rect.left - tooltipWidth - padding,
      };
    case "right":
      return {
        top: Math.max(padding, rect.top + rect.height / 2 - tooltipHeight / 2),
        left: rect.left + rect.width + padding,
      };
    default:
      return {
        top: rect.top + rect.height + padding,
        left: Math.max(padding, rect.left + rect.width / 2 - tooltipWidth / 2),
      };
  }
}

export function TutorialOverlay({
  steps,
  onComplete,
  onSkip,
}: {
  steps: TutorialStep[];
  onComplete: () => void;
  onSkip: () => void;
}) {
  const [currentStep, setCurrentStep] = useState(0);
  const [spotlight, setSpotlight] = useState<SpotlightRect | null>(null);
  const [isComplete, setIsComplete] = useState(false);

  const updateSpotlight = useCallback(() => {
    const step = steps[currentStep];
    if (!step) return;

    const el = document.querySelector(step.target);
    if (el) {
      const rect = el.getBoundingClientRect();
      setSpotlight({
        top: rect.top - 8,
        left: rect.left - 8,
        width: rect.width + 16,
        height: rect.height + 16,
      });
      el.scrollIntoView({ behavior: "smooth", block: "center" });
    } else {
      setSpotlight(null);
    }
  }, [currentStep, steps]);

  useEffect(() => {
    updateSpotlight();
    window.addEventListener("resize", updateSpotlight);
    return () => window.removeEventListener("resize", updateSpotlight);
  }, [updateSpotlight]);

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      setIsComplete(true);
      setTimeout(onComplete, 2000);
    }
  };

  const handlePrev = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const step = steps[currentStep];
  const position = step?.position || "bottom";
  const tooltipPos = spotlight
    ? getTooltipPosition(spotlight, position, window.innerWidth, window.innerHeight)
    : { top: 0, left: 0 };

  return (
    <div className="fixed inset-0 z-[100]">
      {/* Dark overlay with spotlight cutout */}
      <svg className="absolute inset-0 w-full h-full">
        <defs>
          <mask id="spotlight-mask">
            <rect width="100%" height="100%" fill="white" />
            {spotlight && (
              <rect
                x={spotlight.left}
                y={spotlight.top}
                width={spotlight.width}
                height={spotlight.height}
                rx={16}
                fill="black"
              />
            )}
          </mask>
        </defs>
        <rect
          width="100%"
          height="100%"
          fill="rgba(0,0,0,0.6)"
          mask="url(#spotlight-mask)"
        />
      </svg>

      {/* Spotlight border */}
      {spotlight && (
        <motion.div
          layoutId="spotlight"
          className="absolute border-2 border-[#F4C95D] rounded-2xl pointer-events-none"
          style={{
            top: spotlight.top,
            left: spotlight.left,
            width: spotlight.width,
            height: spotlight.height,
          }}
          animate={{
            boxShadow: [
              "0 0 0 0 rgba(244,201,93,0.4)",
              "0 0 0 8px rgba(244,201,93,0)",
            ],
          }}
          transition={{ repeat: Infinity, duration: 1.5 }}
        />
      )}

      {/* Completion celebration */}
      <AnimatePresence>
        {isComplete && (
          <motion.div
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="absolute inset-0 flex items-center justify-center"
          >
            <div className="bg-white rounded-3xl p-10 shadow-2xl text-center max-w-sm mx-4">
              <motion.div
                animate={{ rotate: [0, -10, 10, -10, 0] }}
                transition={{ duration: 0.5 }}
                className="text-6xl mb-4"
              >
                🎉
              </motion.div>
              <h3 className="text-2xl font-bold text-[#2F2F2F] mb-2">Tour Complete!</h3>
              <p className="text-[#6B7280]">You know your way around! Let&apos;s start learning!</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tooltip */}
      {!isComplete && spotlight && (
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="absolute z-10 w-80"
          style={{
            top: tooltipPos.top,
            left: tooltipPos.left,
          }}
        >
          <div className="bg-white rounded-2xl shadow-xl border border-[#E5E2DA] p-5">
            {/* Panda avatar */}
            <div className="flex items-start gap-3 mb-3">
              <div className="w-10 h-10 rounded-full bg-[#4F7C57] flex items-center justify-center text-white text-lg flex-shrink-0">
                🐼
              </div>
              <div>
                <h4 className="font-bold text-[#2F2F2F] text-lg">{step.title}</h4>
                <p className="text-[#6B7280] text-sm mt-1">{step.description}</p>
              </div>
            </div>

            {/* Progress dots */}
            <div className="flex items-center justify-center gap-1.5 mb-4">
              {steps.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentStep
                      ? "bg-[#4F7C57]"
                      : i < currentStep
                        ? "bg-[#A8D08D]"
                        : "bg-[#E5E2DA]"
                  }`}
                />
              ))}
            </div>

            {/* Actions */}
            <div className="flex items-center justify-between">
              <button
                onClick={onSkip}
                className="text-sm text-[#6B7280] hover:text-[#2F2F2F] transition-colors"
              >
                Skip tour
              </button>
              <div className="flex gap-2">
                {currentStep > 0 && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={handlePrev}
                    className="rounded-xl"
                  >
                    <ChevronLeft size={16} />
                  </Button>
                )}
                <Button
                  size="sm"
                  onClick={handleNext}
                  className="bg-[#4F7C57] hover:bg-[#3d6345] text-white rounded-xl px-4"
                >
                  {currentStep === steps.length - 1 ? (
                    <>
                      Finish <PartyPopper size={14} className="ml-1" />
                    </>
                  ) : (
                    <>
                      Next <ChevronRight size={14} />
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Close button */}
      <button
        onClick={onSkip}
        className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/90 flex items-center justify-center hover:bg-white transition-colors shadow-md"
      >
        <X size={18} className="text-[#6B7280]" />
      </button>
    </div>
  );
}

// Hook for managing tutorial state
export function useTutorial(key: string) {
  const [showTutorial, setShowTutorial] = useState(false);

  useEffect(() => {
    const seen = localStorage.getItem(`tutorial-${key}`);
    if (!seen) {
      const timer = setTimeout(() => setShowTutorial(true), 1000);
      return () => clearTimeout(timer);
    }
  }, [key]);

  const completeTutorial = useCallback(() => {
    localStorage.setItem(`tutorial-${key}`, "true");
    setShowTutorial(false);
  }, [key]);

  const resetTutorial = useCallback(() => {
    localStorage.removeItem(`tutorial-${key}`);
    setShowTutorial(true);
  }, [key]);

  return { showTutorial, completeTutorial, resetTutorial };
}
