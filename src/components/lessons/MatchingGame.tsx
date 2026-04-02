"use client"

import { useState, useCallback, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface MatchingGameProps {
  pairs: Array<{ left: string; right: string }>
  onComplete: (score: number) => void
  title: string
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function MatchingGame({ pairs, onComplete, title }: MatchingGameProps) {
  const shuffledLeft = useMemo(() => shuffle(pairs.map((p) => p.left)), [pairs])
  const shuffledRight = useMemo(() => shuffle(pairs.map((p) => p.right)), [pairs])

  const [selectedLeft, setSelectedLeft] = useState<string | null>(null)
  const [selectedRight, setSelectedRight] = useState<string | null>(null)
  const [matchedPairs, setMatchedPairs] = useState<Set<string>>(new Set())
  const [wrongPair, setWrongPair] = useState<{ left: string; right: string } | null>(null)
  const [score, setScore] = useState(0)
  const [attempts, setAttempts] = useState(0)
  const [completed, setCompleted] = useState(false)

  const pairMap = useMemo(() => {
    const map = new Map<string, string>()
    pairs.forEach((p) => map.set(p.left, p.right))
    return map
  }, [pairs])

  const checkMatch = useCallback(
    (left: string, right: string) => {
      setAttempts((a) => a + 1)
      if (pairMap.get(left) === right) {
        const newMatched = new Set(matchedPairs)
        newMatched.add(left)
        setMatchedPairs(newMatched)
        setScore((s) => s + 1)
        setSelectedLeft(null)
        setSelectedRight(null)
        if (newMatched.size === pairs.length) {
          setCompleted(true)
          onComplete(score + 1)
        }
      } else {
        setWrongPair({ left, right })
        setTimeout(() => {
          setWrongPair(null)
          setSelectedLeft(null)
          setSelectedRight(null)
        }, 600)
      }
    },
    [matchedPairs, pairMap, pairs.length, onComplete, score]
  )

  const handleLeftClick = useCallback(
    (item: string) => {
      if (matchedPairs.has(item) || wrongPair) return
      setSelectedLeft(item)
      if (selectedRight) {
        checkMatch(item, selectedRight)
      }
    },
    [matchedPairs, wrongPair, selectedRight, checkMatch]
  )

  const handleRightClick = useCallback(
    (item: string) => {
      const isMatched = Array.from(matchedPairs).some(
        (left) => pairMap.get(left) === item
      )
      if (isMatched || wrongPair) return
      setSelectedRight(item)
      if (selectedLeft) {
        checkMatch(selectedLeft, item)
      }
    },
    [matchedPairs, pairMap, wrongPair, selectedLeft, checkMatch]
  )

  const isRightMatched = (item: string) =>
    Array.from(matchedPairs).some((left) => pairMap.get(left) === item)

  if (completed) {
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#DDEED5] p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-6xl"
        >
          🎉
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-2xl font-bold text-[#4F7C57]"
        >
          Amazing job!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-[#4F7C57]"
        >
          You matched {score} out of {pairs.length} pairs!
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex gap-1"
        >
          {Array.from({ length: score }).map((_, i) => (
            <motion.span
              key={i}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="text-3xl"
            >
              ⭐
            </motion.span>
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-6 rounded-3xl bg-[#F7F5EF] p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#4F7C57]">{title}</h2>
        <p className="mt-1 text-sm text-[#4F7C57]/70">
          Match the items from each column! Tap one from the left, then one from the right.
        </p>
      </div>

      <div className="flex items-center justify-between rounded-2xl bg-[#DDEED5] px-4 py-2">
        <span className="text-sm font-medium text-[#4F7C57]">
          Matched: {matchedPairs.size}/{pairs.length}
        </span>
        <span className="text-sm font-medium text-[#4F7C57]">
          Attempts: {attempts}
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="flex flex-col gap-3">
          {shuffledLeft.map((item) => {
            const isMatched = matchedPairs.has(item)
            const isSelected = selectedLeft === item
            const isWrong = wrongPair?.left === item
            return (
              <motion.button
                key={item}
                onClick={() => handleLeftClick(item)}
                disabled={isMatched}
                animate={
                  isWrong
                    ? { x: [0, -8, 8, -8, 8, 0] }
                    : isMatched
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 0.4 }}
                className={cn(
                  "rounded-2xl border-3 px-4 py-4 text-center text-base font-semibold transition-colors",
                  "min-h-[56px] select-none",
                  isMatched
                    ? "border-[#A8D08D] bg-[#A8D08D]/30 text-[#4F7C57]"
                    : isWrong
                    ? "border-red-400 bg-red-50 text-red-600"
                    : isSelected
                    ? "border-[#F4C95D] bg-[#F4C95D]/20 text-[#2F2F2F]"
                    : "border-[#DDEED5] bg-white text-[#2F2F2F] hover:border-[#F4C95D] hover:bg-[#F4C95D]/10"
                )}
              >
                {isMatched && <span className="mr-1">✓</span>}
                {item}
              </motion.button>
            )
          })}
        </div>

        <div className="flex flex-col gap-3">
          {shuffledRight.map((item) => {
            const isMatched = isRightMatched(item)
            const isSelected = selectedRight === item
            const isWrong = wrongPair?.right === item
            return (
              <motion.button
                key={item}
                onClick={() => handleRightClick(item)}
                disabled={isMatched}
                animate={
                  isWrong
                    ? { x: [0, -8, 8, -8, 8, 0] }
                    : isMatched
                    ? { scale: [1, 1.05, 1] }
                    : {}
                }
                transition={{ duration: 0.4 }}
                className={cn(
                  "rounded-2xl border-3 px-4 py-4 text-center text-base font-semibold transition-colors",
                  "min-h-[56px] select-none",
                  isMatched
                    ? "border-[#A8D08D] bg-[#A8D08D]/30 text-[#4F7C57]"
                    : isWrong
                    ? "border-red-400 bg-red-50 text-red-600"
                    : isSelected
                    ? "border-[#F4C95D] bg-[#F4C95D]/20 text-[#2F2F2F]"
                    : "border-[#DDEED5] bg-white text-[#2F2F2F] hover:border-[#F4C95D] hover:bg-[#F4C95D]/10"
                )}
              >
                {isMatched && <span className="mr-1">✓</span>}
                {item}
              </motion.button>
            )
          })}
        </div>
      </div>
    </div>
  )
}
