"use client"

import { useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SpellingPracticeProps {
  words: Array<{ word: string; hint: string; difficulty: string }>
  onComplete: (results: Array<{ word: string; correct: boolean }>) => void
}

export function SpellingPractice({ words, onComplete }: SpellingPracticeProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [userInput, setUserInput] = useState("")
  const [results, setResults] = useState<Array<{ word: string; correct: boolean }>>([])
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [answered, setAnswered] = useState(false)
  const [hintsUsed, setHintsUsed] = useState(0)
  const [revealedLetters, setRevealedLetters] = useState(0)
  const [completed, setCompleted] = useState(false)

  const current = words[currentIndex]
  const wordLength = current.word.length

  const getDashes = () => {
    const letters = current.word.split("")
    return letters.map((letter, i) => {
      if (i < revealedLetters) return letter
      return "_"
    })
  }

  const handleRevealHint = useCallback(() => {
    if (revealedLetters < current.word.length - 1) {
      setRevealedLetters((r) => r + 1)
      setHintsUsed((h) => h + 1)
    }
  }, [revealedLetters, current.word.length])

  const handleSubmit = useCallback(() => {
    if (!userInput.trim() || answered) return
    const isCorrect = userInput.trim().toLowerCase() === current.word.toLowerCase()
    setFeedback(isCorrect ? "correct" : "incorrect")
    setAnswered(true)
    setResults((prev) => [...prev, { word: current.word, correct: isCorrect }])
  }, [userInput, answered, current.word])

  const handleNext = useCallback(() => {
    if (currentIndex + 1 >= words.length) {
      const finalResults = [...results]
      setCompleted(true)
      onComplete(finalResults)
    } else {
      setCurrentIndex((i) => i + 1)
      setUserInput("")
      setFeedback(null)
      setAnswered(false)
      setRevealedLetters(0)
    }
  }, [currentIndex, words.length, results, onComplete])

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty.toLowerCase()) {
      case "easy":
        return "bg-[#A8D08D] text-[#4F7C57]"
      case "medium":
        return "bg-[#F4C95D] text-[#2F2F2F]"
      case "hard":
        return "bg-orange-200 text-orange-700"
      default:
        return "bg-[#DDEED5] text-[#4F7C57]"
    }
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
          {correctCount === words.length ? "🏆" : correctCount > words.length / 2 ? "🌟" : "📖"}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-2xl font-bold text-[#4F7C57]"
        >
          {correctCount === words.length
            ? "Perfect spelling!"
            : correctCount > words.length / 2
            ? "Great spelling!"
            : "Keep practicing!"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-[#4F7C57]"
        >
          You spelled {correctCount} of {words.length} words correctly!
        </motion.p>

        {/* Results list */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex w-full max-w-sm flex-col gap-2"
        >
          {results.map((r, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className={cn(
                "flex items-center justify-between rounded-xl px-4 py-2",
                r.correct ? "bg-[#A8D08D]/30" : "bg-[#F4C95D]/30"
              )}
            >
              <span className="font-medium text-[#2F2F2F]">{r.word}</span>
              <span>{r.correct ? "✅" : "📝"}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-[#F7F5EF] p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#4F7C57]">Spelling Practice</h2>
        <p className="mt-1 text-sm text-[#4F7C57]/70">
          Can you spell this word?
        </p>
      </div>

      {/* Progress and difficulty */}
      <div className="flex items-center justify-between">
        <div className="flex gap-2">
          {words.map((_, i) => (
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
        <span
          className={cn(
            "rounded-full px-3 py-0.5 text-xs font-bold uppercase",
            getDifficultyColor(current.difficulty)
          )}
        >
          {current.difficulty}
        </span>
      </div>

      {/* Hint area */}
      <div className="rounded-2xl bg-[#DDEED5] p-5 text-center">
        <p className="text-sm font-semibold text-[#4F7C57]/70">Hint:</p>
        <p className="mt-1 text-lg font-bold text-[#4F7C57]">{current.hint}</p>
      </div>

      {/* Word length dashes */}
      <div className="flex items-center justify-center gap-2">
        {getDashes().map((char, i) => (
          <motion.span
            key={i}
            initial={char !== "_" ? { scale: 0.5, opacity: 0 } : false}
            animate={{ scale: 1, opacity: 1 }}
            className={cn(
              "flex h-10 w-10 items-center justify-center rounded-xl border-2 text-xl font-bold",
              char !== "_"
                ? "border-[#A8D08D] bg-[#A8D08D]/20 text-[#4F7C57]"
                : "border-[#DDEED5] bg-white text-[#2F2F2F]"
            )}
          >
            {char}
          </motion.span>
        ))}
      </div>

      {/* Letter count */}
      <p className="text-center text-xs text-[#4F7C57]/60">
        {wordLength} letters
      </p>

      {/* Input */}
      <AnimatePresence mode="wait">
        {!answered ? (
          <motion.div
            key="input"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="flex flex-col gap-3"
          >
            <input
              type="text"
              value={userInput}
              onChange={(e) => setUserInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") handleSubmit()
              }}
              placeholder="Type the word..."
              autoFocus
              className={cn(
                "w-full rounded-2xl border-3 border-[#F4C95D] bg-white px-4 py-3",
                "text-center text-xl font-bold text-[#2F2F2F]",
                "outline-none focus:border-[#4F7C57] focus:ring-2 focus:ring-[#A8D08D]"
              )}
            />
            <div className="flex items-center justify-center gap-3">
              <Button
                onClick={handleRevealHint}
                disabled={revealedLetters >= current.word.length - 1}
                className="rounded-2xl bg-[#F4C95D] px-5 py-3 text-sm font-bold text-[#2F2F2F] hover:bg-[#F4C95D]/80 disabled:opacity-40"
              >
                💡 Show a letter
              </Button>
              <Button
                onClick={handleSubmit}
                disabled={!userInput.trim()}
                className="rounded-2xl bg-[#A8D08D] px-6 py-3 text-sm font-bold text-[#4F7C57] hover:bg-[#A8D08D]/80 disabled:opacity-40"
              >
                Check Spelling
              </Button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="feedback"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col gap-3"
          >
            <div
              className={cn(
                "rounded-2xl p-4 text-center",
                feedback === "correct" ? "bg-[#A8D08D]/20" : "bg-[#F4C95D]/20"
              )}
            >
              {feedback === "correct" ? (
                <div>
                  <p className="text-xl font-bold text-[#4F7C57]">
                    🌟 Perfect spelling!
                  </p>
                  <p className="mt-1 text-lg font-semibold text-[#4F7C57]">
                    {current.word}
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-lg font-bold text-[#2F2F2F]">
                    Almost! The correct spelling is:
                  </p>
                  <p className="mt-2 text-2xl font-bold tracking-wide text-[#4F7C57]">
                    {current.word}
                  </p>
                  <p className="mt-2 text-sm text-[#4F7C57]">
                    You wrote: <span className="line-through">{userInput}</span>
                  </p>
                  <p className="mt-1 text-xs text-[#4F7C57]">
                    Don&apos;t worry, practice makes perfect! 💪
                  </p>
                </div>
              )}
            </div>
            <div className="flex justify-center">
              <Button
                onClick={handleNext}
                className="rounded-2xl bg-[#A8D08D] px-6 py-3 text-base font-bold text-[#4F7C57] hover:bg-[#A8D08D]/80"
              >
                {currentIndex + 1 >= words.length ? "See Results" : "Next Word →"}
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
