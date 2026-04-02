"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface StepByStepProps {
  title: string
  steps: Array<{ content: string; visual?: string; highlight?: string }>
  onComplete: () => void
}

const visualIcons: Record<string, string> = {
  star: "⭐",
  lightbulb: "💡",
  book: "📖",
  pencil: "✏️",
  rocket: "🚀",
  heart: "❤️",
  check: "✅",
  plant: "🌱",
  sun: "☀️",
  moon: "🌙",
  rainbow: "🌈",
  fire: "🔥",
  globe: "🌍",
  music: "🎵",
  art: "🎨",
  science: "🔬",
  math: "🔢",
  trophy: "🏆",
}

export function StepByStep({ title, steps, onComplete }: StepByStepProps) {
  const [currentStep, setCurrentStep] = useState(0)
  const [completed, setCompleted] = useState(false)

  const step = steps[currentStep]
  const isLastStep = currentStep === steps.length - 1
  const isFirstStep = currentStep === 0

  const handleNext = () => {
    if (isLastStep) {
      setCompleted(true)
      onComplete()
    } else {
      setCurrentStep((s) => s + 1)
    }
  }

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep((s) => s - 1)
    }
  }

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#DDEED5] p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-6xl"
        >
          🎓
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-2xl font-bold text-[#4F7C57]"
        >
          Lesson Complete!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-[#4F7C57]"
        >
          You went through all {steps.length} steps. Great learning!
        </motion.p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-[#F7F5EF] p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#4F7C57]">{title}</h2>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {steps.map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentStep(i)}
            className={cn(
              "h-3 w-3 rounded-full transition-all",
              i === currentStep
                ? "scale-125 bg-[#F4C95D]"
                : i < currentStep
                ? "bg-[#A8D08D]"
                : "bg-[#DDEED5]"
            )}
          />
        ))}
      </div>

      {/* Step counter */}
      <div className="text-center">
        <span className="rounded-full bg-[#DDEED5] px-4 py-1 text-sm font-semibold text-[#4F7C57]">
          Step {currentStep + 1} of {steps.length}
        </span>
      </div>

      {/* Step content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={currentStep}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="flex flex-col items-center gap-4 rounded-2xl bg-white p-6 shadow-sm"
        >
          {/* Visual icon */}
          {step.visual && (
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.1 }}
              className="flex h-20 w-20 items-center justify-center rounded-full bg-[#DDEED5] text-4xl"
            >
              {visualIcons[step.visual] || step.visual}
            </motion.div>
          )}

          {/* Content */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="text-center text-lg leading-relaxed text-[#2F2F2F]"
          >
            {step.highlight ? (
              <>
                {step.content.split(step.highlight).map((part, i, arr) => (
                  <span key={i}>
                    {part}
                    {i < arr.length - 1 && (
                      <span className="rounded-lg bg-[#F4C95D]/30 px-1 font-bold text-[#4F7C57]">
                        {step.highlight}
                      </span>
                    )}
                  </span>
                ))}
              </>
            ) : (
              step.content
            )}
          </motion.p>
        </motion.div>
      </AnimatePresence>

      {/* Navigation buttons */}
      <div className="flex items-center justify-between gap-4">
        <Button
          onClick={handlePrev}
          disabled={isFirstStep}
          className={cn(
            "rounded-2xl px-6 py-3 text-base font-bold transition-all",
            isFirstStep
              ? "bg-[#DDEED5] text-[#4F7C57]/40"
              : "bg-[#DDEED5] text-[#4F7C57] hover:bg-[#DDEED5]/80"
          )}
        >
          ← Previous Step
        </Button>
        <Button
          onClick={handleNext}
          className="rounded-2xl bg-[#A8D08D] px-6 py-3 text-base font-bold text-[#4F7C57] hover:bg-[#A8D08D]/80"
        >
          {isLastStep ? "Finish! 🎉" : "Next Step →"}
        </Button>
      </div>
    </div>
  )
}
