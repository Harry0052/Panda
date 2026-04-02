"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface FillInTheBlankProps {
  sentences: Array<{ text: string; blank: string; hint?: string }>
  onComplete: (results: Array<{ correct: boolean }>) => void
  title: string
}

export function FillInTheBlank({ sentences, onComplete, title }: FillInTheBlankProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<Array<{ correct: boolean }>>([])
  const [showHint, setShowHint] = useState(false)
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [answered, setAnswered] = useState(false)
  const [completed, setCompleted] = useState(false)

  const current = sentences[currentIndex]

  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || answered) return
    const isCorrect = userInput.trim().toLowerCase() === current.blank.toLowerCase()
    setFeedback(isCorrect ? "correct" : "incorrect")
    setAnswered(true)
    setResults((prev) => [...prev, { correct: isCorrect }])
  }, [userInput, answered, current.blank])

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= sentences.length) {
      const finalResults = [...results]
      setCompleted(true)
      onComplete(finalResults)
    } else {
      setCurrentIndex((i) => i + 1)
      setUserInput("")
      setShowHint(false)
      setFeedback(null)
      setAnswered(false)
    }
  }, [currentIndex, sentences.length, results, onComplete])

  const renderSentenceWithBlank = () => {
    const parts = current.text.split("___")
    return (
      <div className="flex flex-wrap items-center gap-1 text-xl font-medium text-[#2F2F2F] leading-relaxed">
        {parts.map((part, i) => (
          <span key={i}>
            {part}
            {i < parts.length - 1 && (
              <span className="inline-block mx-1">
                {answered ? (
                  <motion.span
                    initial={{ scale: 0.8, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    className={cn(
                      "inline-block rounded-xl px-3 py-1 font-bold",
                      feedback === "correct"
                        ? "bg-[#A8D08D] text-[#4F7C57]"
                        : "bg-red-100 text-red-600 line-through"
                    )}
                  >
                    {userInput}
                  </motion.span>
                ) : (
                  <input
                    type="text"
                    value={userInput}
                    onChange={(e) => setUserInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") handleSubmit()
                    }}
                    placeholder="type here..."
                    autoFocus
                    className={cn(
                      "inline-block w-40 rounded-xl border-3 border-[#F4C95D] bg-white px-3 py-1",
                      "text-center text-lg font-semibold text-[#2F2F2F]",
                      "outline-none focus:border-[#4F7C57] focus:ring-2 focus:ring-[#A8D08D]"
                    )}
                  />
                )}
              </span>
            )}
          </span>
        ))}
      </div>
    )
  }

  if (completed) {
    const correctCount = results.filter((r) => r.correct).length
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#DDEED5] p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-6xl"
        >
          {correctCount === sentences.length ? "🏆" : "👏"}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-2xl font-bold text-[#4F7C57]"
        >
          {correctCount === sentences.length ? "Perfect score!" : "Great effort!"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-[#4F7C57]"
        >
          You got {correctCount} out of {sentences.length} correct!
        </motion.p>
        <div className="flex gap-1">
          {results.map((r, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6 + i * 0.1 }}
              className="text-2xl"
            >
              {r.correct ? "⭐" : "💪"}
            </motion.span>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-[#F7F5EF] p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#4F7C57]">{title}</h2>
        <p className="mt-1 text-sm text-[#4F7C57]/70">
          Fill in the missing word!
        </p>
      </div>

      {/* Progress dots */}
      <div className="flex items-center justify-center gap-2">
        {sentences.map((_, i) => (
          <div
            key={i}
            className={cn(
              "h-3 w-3 rounded-full transition-colors",
              i < currentIndex
                ? results[i]?.correct
                  ? "bg-[#A8D08D]"
                  : "bg-red-300"
                : i === currentIndex
                ? "bg-[#F4C95D]"
                : "bg-[#DDEED5]"
            )}
          />
        ))}
      </div>

      <div className="rounded-2xl bg-white p-6 shadow-sm">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentIndex}
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -30 }}
            transition={{ duration: 0.3 }}
          >
            {renderSentenceWithBlank()}
          </motion.div>
        </AnimatePresence>

        {/* Feedback for incorrect answer */}
        {feedback === "incorrect" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-[#F4C95D]/20 p-3 text-center"
          >
            <p className="text-sm font-medium text-[#2F2F2F]">
              Almost! The correct answer is{" "}
              <span className="font-bold text-[#4F7C57]">{current.blank}</span>
            </p>
            <p className="mt-1 text-xs text-[#4F7C57]">Keep going, you&apos;re doing great!</p>
          </motion.div>
        )}

        {feedback === "correct" && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="mt-4 rounded-xl bg-[#A8D08D]/20 p-3 text-center"
          >
            <p className="text-lg font-bold text-[#4F7C57]">Awesome! That&apos;s right! 🌟</p>
          </motion.div>
        )}
      </div>

      <div className="flex items-center justify-between gap-3">
        {/* Hint button */}
        {current.hint && !answered && (
          <Button
            onClick={() => setShowHint(true)}
            className="rounded-2xl bg-[#F4C95D] px-5 py-3 text-base font-semibold text-[#2F2F2F] hover:bg-[#F4C95D]/80"
          >
            💡 Hint
          </Button>
        )}
        {showHint && current.hint && !answered && (
          <motion.span
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-sm font-medium text-[#4F7C57]"
          >
            {current.hint}
          </motion.span>
        )}
        <div className="flex-1" />
        {!answered ? (
          <Button
            onClick={handleSubmit}
            disabled={!userInput.trim()}
            className="rounded-2xl bg-[#A8D08D] px-6 py-3 text-base font-bold text-[#4F7C57] hover:bg-[#A8D08D]/80 disabled:opacity-40"
          >
            Check Answer
          </Button>
        ) : (
          <Button
            onClick={handleNext}
            className="rounded-2xl bg-[#A8D08D] px-6 py-3 text-base font-bold text-[#4F7C57] hover:bg-[#A8D08D]/80"
          >
            {currentIndex + 1 >= sentences.length ? "See Results" : "Next →"}
          </Button>
        )}
      </div>
    </div>
  )
}
