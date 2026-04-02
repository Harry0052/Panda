"use client"

import { useState } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"

interface QuizCardProps {
  question: string
  options: string[]
  correctIndex: number
  explanation: string
  onAnswer: (correct: boolean) => void
  subject?: string
}

export function QuizCard({
  question,
  options,
  correctIndex,
  explanation,
  onAnswer,
  subject,
}: QuizCardProps) {
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null)
  const [answered, setAnswered] = useState(false)

  const isCorrect = selectedIndex === correctIndex

  const handleSelect = (index: number) => {
    if (answered) return
    setSelectedIndex(index)
    setAnswered(true)
    onAnswer(index === correctIndex)
  }

  const getOptionStyle = (index: number) => {
    if (!answered) {
      return "border-[#DDEED5] bg-white text-[#2F2F2F] hover:border-[#F4C95D] hover:bg-[#F4C95D]/10"
    }
    if (index === correctIndex) {
      return "border-[#A8D08D] bg-[#A8D08D]/20 text-[#4F7C57]"
    }
    if (index === selectedIndex) {
      return "border-orange-300 bg-orange-50 text-orange-600"
    }
    return "border-gray-200 bg-gray-50 text-gray-400"
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-[#F7F5EF] p-6">
      {/* Subject badge */}
      {subject && (
        <div className="flex justify-center">
          <span className="rounded-full bg-[#DDEED5] px-4 py-1 text-xs font-bold uppercase tracking-wide text-[#4F7C57]">
            {subject}
          </span>
        </div>
      )}

      {/* Question */}
      <h2 className="text-center text-xl font-bold leading-relaxed text-[#2F2F2F] md:text-2xl">
        {question}
      </h2>

      {/* Options - 2x2 grid */}
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        {options.map((option, index) => (
          <motion.button
            key={index}
            onClick={() => handleSelect(index)}
            disabled={answered}
            whileTap={!answered ? { scale: 0.97 } : undefined}
            animate={
              answered && index === selectedIndex && !isCorrect
                ? { x: [0, -5, 5, -5, 5, 0] }
                : answered && index === correctIndex
                ? { scale: [1, 1.05, 1] }
                : {}
            }
            transition={{ duration: 0.4 }}
            className={cn(
              "flex items-center gap-3 rounded-2xl border-3 p-4 text-left text-base font-semibold transition-colors",
              "min-h-[64px] select-none",
              getOptionStyle(index)
            )}
          >
            <span
              className={cn(
                "flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold",
                !answered
                  ? "bg-[#DDEED5] text-[#4F7C57]"
                  : index === correctIndex
                  ? "bg-[#A8D08D] text-white"
                  : index === selectedIndex
                  ? "bg-orange-300 text-white"
                  : "bg-gray-200 text-gray-400"
              )}
            >
              {String.fromCharCode(65 + index)}
            </span>
            <span className="flex-1">{option}</span>
            {answered && index === correctIndex && (
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="text-xl"
              >
                ✓
              </motion.span>
            )}
          </motion.button>
        ))}
      </div>

      {/* Feedback */}
      {answered && (
        <motion.div
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className={cn(
            "rounded-2xl p-4 text-center",
            isCorrect ? "bg-[#A8D08D]/20" : "bg-[#F4C95D]/20"
          )}
        >
          {isCorrect ? (
            <div>
              <motion.p
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                className="text-xl font-bold text-[#4F7C57]"
              >
                🌟 Excellent! You got it!
              </motion.p>
              <p className="mt-2 text-sm text-[#4F7C57]">{explanation}</p>
            </div>
          ) : (
            <div>
              <p className="text-lg font-bold text-[#2F2F2F]">
                Not quite, but that&apos;s okay! 💪
              </p>
              <p className="mt-2 text-sm text-[#2F2F2F]">{explanation}</p>
            </div>
          )}
        </motion.div>
      )}
    </div>
  )
}
