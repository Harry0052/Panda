"use client"

import { useState, useMemo, useCallback } from "react"
import { motion, AnimatePresence, Reorder } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SequenceOrderProps {
  title: string
  items: Array<{ id: string; text: string }>
  correctOrder: string[]
  onComplete: (correct: boolean) => void
}

function shuffle<T>(array: T[]): T[] {
  const shuffled = [...array]
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]
  }
  return shuffled
}

export function SequenceOrder({ title, items, correctOrder, onComplete }: SequenceOrderProps) {
  const [orderedItems, setOrderedItems] = useState(() => shuffle([...items]))
  const [feedback, setFeedback] = useState<"correct" | "incorrect" | null>(null)
  const [completed, setCompleted] = useState(false)
  const [attempts, setAttempts] = useState(0)

  const moveItem = useCallback((index: number, direction: "up" | "down") => {
    setOrderedItems((prev) => {
      const newItems = [...prev]
      const targetIndex = direction === "up" ? index - 1 : index + 1
      if (targetIndex < 0 || targetIndex >= newItems.length) return prev
      ;[newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]]
      return newItems
    })
    setFeedback(null)
  }, [])

  const handleCheck = useCallback(() => {
    const currentOrder = orderedItems.map((item) => item.id)
    const isCorrect = currentOrder.every((id, i) => id === correctOrder[i])
    setAttempts((a) => a + 1)
    if (isCorrect) {
      setFeedback("correct")
      setCompleted(true)
      onComplete(true)
    } else {
      setFeedback("incorrect")
    }
  }, [orderedItems, correctOrder, onComplete])

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
          Perfect order!
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-[#4F7C57]"
        >
          You got it in {attempts} {attempts === 1 ? "try" : "tries"}!
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.7 }}
          className="flex flex-col gap-2">
          {orderedItems.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.8 + i * 0.1 }}
              className="flex items-center gap-2 rounded-xl bg-[#A8D08D]/30 px-4 py-2"
            >
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-[#A8D08D] text-sm font-bold text-white">
                {i + 1}
              </span>
              <span className="font-medium text-[#4F7C57]">{item.text}</span>
            </motion.div>
          ))}
        </motion.div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-[#F7F5EF] p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#4F7C57]">{title}</h2>
        <p className="mt-1 text-sm text-[#4F7C57]/70">
          Put these in the right order! Drag or use the arrows.
        </p>
      </div>

      {/* Reorderable list */}
      <Reorder.Group
        axis="y"
        values={orderedItems}
        onReorder={(newOrder) => {
          setOrderedItems(newOrder)
          setFeedback(null)
        }}
        className="flex flex-col gap-2"
      >
        {orderedItems.map((item, index) => (
          <Reorder.Item
            key={item.id}
            value={item}
            className="cursor-grab select-none active:cursor-grabbing"
          >
            <motion.div
              layout
              className={cn(
                "flex items-center gap-3 rounded-2xl border-3 bg-white p-4 transition-colors",
                feedback === "incorrect"
                  ? "border-[#F4C95D]"
                  : "border-[#DDEED5]"
              )}
            >
              {/* Position number */}
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#DDEED5] text-sm font-bold text-[#4F7C57]">
                {index + 1}
              </span>

              {/* Text */}
              <span className="flex-1 text-base font-medium text-[#2F2F2F]">
                {item.text}
              </span>

              {/* Arrow buttons */}
              <div className="flex flex-col gap-0.5">
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveItem(index, "up")
                  }}
                  disabled={index === 0}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                    index === 0
                      ? "text-gray-300"
                      : "bg-[#DDEED5] text-[#4F7C57] hover:bg-[#A8D08D]"
                  )}
                >
                  ▲
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation()
                    moveItem(index, "down")
                  }}
                  disabled={index === orderedItems.length - 1}
                  className={cn(
                    "flex h-7 w-7 items-center justify-center rounded-lg text-sm font-bold transition-colors",
                    index === orderedItems.length - 1
                      ? "text-gray-300"
                      : "bg-[#DDEED5] text-[#4F7C57] hover:bg-[#A8D08D]"
                  )}
                >
                  ▼
                </button>
              </div>
            </motion.div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {/* Feedback */}
      {feedback === "incorrect" && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl bg-[#F4C95D]/20 p-3 text-center"
        >
          <p className="text-base font-semibold text-[#2F2F2F]">
            Not quite right yet. Keep trying! 💪
          </p>
          <p className="mt-1 text-xs text-[#4F7C57]">
            Try rearranging the items and check again.
          </p>
        </motion.div>
      )}

      {/* Check button */}
      <div className="flex justify-center">
        <Button
          onClick={handleCheck}
          className="rounded-2xl bg-[#A8D08D] px-8 py-3 text-base font-bold text-[#4F7C57] hover:bg-[#A8D08D]/80"
        >
          Check Order ✓
        </Button>
      </div>
    </div>
  )
}
