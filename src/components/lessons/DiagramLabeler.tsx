"use client"

import { useState, useCallback, useRef } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface LabelData {
  id: string
  text: string
  x: number
  y: number
  correctZone: { x: number; y: number; width: number; height: number }
}

interface DiagramLabelerProps {
  title: string
  description: string
  labels: LabelData[]
  imageDescription: string
  onComplete: (score: number) => void
}

interface PlacedLabel {
  id: string
  x: number
  y: number
  correct: boolean
}

export function DiagramLabeler({
  title,
  description,
  labels,
  imageDescription,
  onComplete,
}: DiagramLabelerProps) {
  const diagramRef = useRef<HTMLDivElement>(null)
  const [placedLabels, setPlacedLabels] = useState<Map<string, PlacedLabel>>(new Map())
  const [, setDraggedLabel] = useState<string | null>(null)
  const [completed, setCompleted] = useState(false)
  const [score, setScore] = useState(0)

  const unplacedLabels = labels.filter((l) => !placedLabels.has(l.id))

  const isInZone = (
    dropX: number,
    dropY: number,
    zone: { x: number; y: number; width: number; height: number }
  ) => {
    return (
      dropX >= zone.x - 10 &&
      dropX <= zone.x + zone.width + 10 &&
      dropY >= zone.y - 10 &&
      dropY <= zone.y + zone.height + 10
    )
  }

  const handleDragEnd = useCallback(
    (labelId: string, event: PointerEvent | MouseEvent | TouchEvent) => {
      if (!diagramRef.current) return
      const rect = diagramRef.current.getBoundingClientRect()

      let clientX: number
      let clientY: number
      if ("touches" in event) {
        clientX = event.changedTouches[0].clientX
        clientY = event.changedTouches[0].clientY
      } else {
        clientX = event.clientX
        clientY = event.clientY
      }

      const relX = ((clientX - rect.left) / rect.width) * 100
      const relY = ((clientY - rect.top) / rect.height) * 100

      const label = labels.find((l) => l.id === labelId)
      if (!label) return

      if (
        relX >= 0 &&
        relX <= 100 &&
        relY >= 0 &&
        relY <= 100
      ) {
        const correct = isInZone(relX, relY, label.correctZone)
        const snapX = correct
          ? label.correctZone.x + label.correctZone.width / 2
          : relX
        const snapY = correct
          ? label.correctZone.y + label.correctZone.height / 2
          : relY

        setPlacedLabels((prev) => {
          const next = new Map(prev)
          next.set(labelId, { id: labelId, x: snapX, y: snapY, correct })
          return next
        })
      }

      setDraggedLabel(null)
    },
    [labels]
  )

  const handleCheck = useCallback(() => {
    const correctCount = Array.from(placedLabels.values()).filter((p) => p.correct).length
    setScore(correctCount)
    setCompleted(true)
    onComplete(correctCount)
  }, [placedLabels, onComplete])

  const handleReset = useCallback(() => {
    setPlacedLabels(new Map())
    setCompleted(false)
    setScore(0)
  }, [])

  const removeLabel = useCallback((labelId: string) => {
    if (completed) return
    setPlacedLabels((prev) => {
      const next = new Map(prev)
      next.delete(labelId)
      return next
    })
  }, [completed])

  const allPlaced = placedLabels.size === labels.length

  if (completed) {
    const allCorrect = score === labels.length
    return (
      <div className="flex flex-col items-center justify-center gap-6 rounded-3xl bg-[#DDEED5] p-8">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 200, damping: 15 }}
          className="text-6xl"
        >
          {allCorrect ? "🎉" : "👍"}
        </motion.div>
        <motion.h2
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="text-center text-2xl font-bold text-[#4F7C57]"
        >
          {allCorrect ? "Perfect labeling!" : "Nice work!"}
        </motion.h2>
        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.5 }}
          className="text-lg text-[#4F7C57]"
        >
          You placed {score} of {labels.length} labels correctly!
        </motion.p>
        {!allCorrect && (
          <Button
            onClick={handleReset}
            className="rounded-2xl bg-[#F4C95D] px-6 py-3 text-base font-bold text-[#2F2F2F] hover:bg-[#F4C95D]/80"
          >
            Try Again
          </Button>
        )}
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-[#F7F5EF] p-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-[#4F7C57]">{title}</h2>
        <p className="mt-1 text-sm text-[#4F7C57]/70">{description}</p>
      </div>

      {/* Diagram area */}
      <div
        ref={diagramRef}
        className="relative mx-auto aspect-[4/3] w-full max-w-lg overflow-hidden rounded-2xl border-3 border-[#DDEED5] bg-white"
      >
        {/* Zone outlines */}
        {labels.map((label) => (
          <div
            key={`zone-${label.id}`}
            className={cn(
              "absolute rounded-xl border-2 border-dashed transition-colors",
              placedLabels.get(label.id)?.correct
                ? "border-[#A8D08D] bg-[#A8D08D]/10"
                : "border-[#F4C95D]/50 bg-[#F4C95D]/5"
            )}
            style={{
              left: `${label.correctZone.x}%`,
              top: `${label.correctZone.y}%`,
              width: `${label.correctZone.width}%`,
              height: `${label.correctZone.height}%`,
            }}
          />
        ))}

        {/* Image description overlay */}
        <div className="absolute inset-0 flex items-center justify-center p-4 pointer-events-none">
          <p className="text-center text-sm font-medium text-[#4F7C57]/40">
            {imageDescription}
          </p>
        </div>

        {/* Placed labels */}
        {Array.from(placedLabels.values()).map((placed) => {
          const label = labels.find((l) => l.id === placed.id)
          if (!label) return null
          return (
            <motion.button
              key={`placed-${placed.id}`}
              initial={{ scale: 0.8 }}
              animate={{ scale: 1 }}
              onClick={() => removeLabel(placed.id)}
              className={cn(
                "absolute -translate-x-1/2 -translate-y-1/2 rounded-full px-3 py-1.5 text-xs font-bold shadow-md",
                "cursor-pointer select-none",
                placed.correct
                  ? "bg-[#A8D08D] text-[#4F7C57]"
                  : "bg-[#F4C95D] text-[#2F2F2F]"
              )}
              style={{
                left: `${placed.x}%`,
                top: `${placed.y}%`,
              }}
            >
              {label.text}
            </motion.button>
          )
        })}
      </div>

      {/* Label chips tray */}
      <div className="flex flex-wrap items-center justify-center gap-2">
        {unplacedLabels.length > 0 ? (
          unplacedLabels.map((label) => (
            <motion.div
              key={label.id}
              drag
              dragSnapToOrigin
              onDragStart={() => setDraggedLabel(label.id)}
              onDragEnd={(_, info) => {
                handleDragEnd(label.id, {
                  clientX: info.point.x,
                  clientY: info.point.y,
                } as MouseEvent)
              }}
              whileDrag={{ scale: 1.1, zIndex: 50 }}
              className={cn(
                "cursor-grab rounded-full border-2 border-[#DDEED5] bg-white px-4 py-2 text-sm font-bold text-[#2F2F2F]",
                "select-none shadow-sm active:cursor-grabbing",
                "hover:border-[#F4C95D] hover:bg-[#F4C95D]/10"
              )}
            >
              {label.text}
            </motion.div>
          ))
        ) : (
          <p className="text-sm font-medium text-[#4F7C57]">
            All labels placed! Check your work below.
          </p>
        )}
      </div>

      <p className="text-center text-xs text-[#4F7C57]/60">
        Drag labels onto the diagram. Tap a placed label to remove it.
      </p>

      <div className="flex justify-center">
        <Button
          onClick={handleCheck}
          disabled={!allPlaced}
          className="rounded-2xl bg-[#A8D08D] px-8 py-3 text-base font-bold text-[#4F7C57] hover:bg-[#A8D08D]/80 disabled:opacity-40"
        >
          Check Labels
        </Button>
      </div>
    </div>
  )
}
