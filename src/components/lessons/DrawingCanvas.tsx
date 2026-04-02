"use client"

import { useState, useRef, useCallback, useEffect } from "react"
import { motion } from "framer-motion"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface DrawingCanvasProps {
  prompt: string
  onSave: (dataUrl: string) => void
  width?: number
  height?: number
}

const COLORS = [
  { name: "Black", value: "#2F2F2F" },
  { name: "Red", value: "#E74C3C" },
  { name: "Blue", value: "#3498DB" },
  { name: "Green", value: "#4F7C57" },
  { name: "Yellow", value: "#F4C95D" },
  { name: "Purple", value: "#9B59B6" },
]

const BRUSH_SIZES = [
  { name: "S", value: 3 },
  { name: "M", value: 8 },
  { name: "L", value: 16 },
]

export function DrawingCanvas({
  prompt,
  onSave,
  width = 400,
  height = 300,
}: DrawingCanvasProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)
  const [color, setColor] = useState(COLORS[0].value)
  const [brushSize, setBrushSize] = useState(BRUSH_SIZES[1].value)
  const [isEraser, setIsEraser] = useState(false)
  const [hasDrawn, setHasDrawn] = useState(false)
  const lastPointRef = useRef<{ x: number; y: number } | null>(null)

  useEffect(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
  }, [])

  const getCanvasPoint = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      const canvas = canvasRef.current
      if (!canvas) return null
      const rect = canvas.getBoundingClientRect()
      const scaleX = canvas.width / rect.width
      const scaleY = canvas.height / rect.height
      let clientX: number, clientY: number
      if ("touches" in e) {
        if (e.touches.length === 0) return null
        clientX = e.touches[0].clientX
        clientY = e.touches[0].clientY
      } else {
        clientX = e.clientX
        clientY = e.clientY
      }
      return {
        x: (clientX - rect.left) * scaleX,
        y: (clientY - rect.top) * scaleY,
      }
    },
    []
  )

  const drawLine = useCallback(
    (from: { x: number; y: number }, to: { x: number; y: number }) => {
      const canvas = canvasRef.current
      if (!canvas) return
      const ctx = canvas.getContext("2d")
      if (!ctx) return
      ctx.beginPath()
      ctx.moveTo(from.x, from.y)
      ctx.lineTo(to.x, to.y)
      ctx.strokeStyle = isEraser ? "#FFFFFF" : color
      ctx.lineWidth = isEraser ? brushSize * 3 : brushSize
      ctx.lineCap = "round"
      ctx.lineJoin = "round"
      ctx.stroke()
    },
    [color, brushSize, isEraser]
  )

  const handleStart = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      const point = getCanvasPoint(e)
      if (!point) return
      setIsDrawing(true)
      setHasDrawn(true)
      lastPointRef.current = point
      // Draw a dot for single clicks
      drawLine(point, point)
    },
    [getCanvasPoint, drawLine]
  )

  const handleMove = useCallback(
    (e: React.MouseEvent | React.TouchEvent) => {
      e.preventDefault()
      if (!isDrawing) return
      const point = getCanvasPoint(e)
      if (!point || !lastPointRef.current) return
      drawLine(lastPointRef.current, point)
      lastPointRef.current = point
    },
    [isDrawing, getCanvasPoint, drawLine]
  )

  const handleEnd = useCallback(() => {
    setIsDrawing(false)
    lastPointRef.current = null
  }, [])

  const handleClear = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext("2d")
    if (!ctx) return
    ctx.fillStyle = "#FFFFFF"
    ctx.fillRect(0, 0, canvas.width, canvas.height)
    setHasDrawn(false)
  }, [])

  const handleSave = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    onSave(canvas.toDataURL("image/png"))
  }, [onSave])

  return (
    <div className="flex flex-col gap-5 rounded-3xl bg-[#F7F5EF] p-6">
      {/* Prompt */}
      <div className="rounded-2xl bg-[#DDEED5] p-4 text-center">
        <p className="text-lg font-bold text-[#4F7C57]">🎨 {prompt}</p>
      </div>

      {/* Canvas */}
      <div className="flex justify-center">
        <div className="rounded-2xl border-3 border-[#DDEED5] bg-white p-1 shadow-sm">
          <canvas
            ref={canvasRef}
            width={width}
            height={height}
            className="block cursor-crosshair rounded-xl touch-none"
            style={{ maxWidth: "100%", height: "auto" }}
            onMouseDown={handleStart}
            onMouseMove={handleMove}
            onMouseUp={handleEnd}
            onMouseLeave={handleEnd}
            onTouchStart={handleStart}
            onTouchMove={handleMove}
            onTouchEnd={handleEnd}
          />
        </div>
      </div>

      {/* Toolbar */}
      <div className="flex flex-col gap-3 rounded-2xl bg-white p-4 shadow-sm">
        {/* Colors */}
        <div className="flex items-center justify-center gap-2">
          <span className="mr-2 text-xs font-bold text-[#4F7C57]">Color:</span>
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => {
                setColor(c.value)
                setIsEraser(false)
              }}
              title={c.name}
              className={cn(
                "h-9 w-9 rounded-full border-3 transition-transform",
                !isEraser && color === c.value
                  ? "scale-110 border-[#4F7C57] ring-2 ring-[#A8D08D]"
                  : "border-gray-200 hover:scale-105"
              )}
              style={{ backgroundColor: c.value }}
            />
          ))}
        </div>

        {/* Brush size and tools */}
        <div className="flex items-center justify-center gap-3">
          <span className="mr-1 text-xs font-bold text-[#4F7C57]">Size:</span>
          {BRUSH_SIZES.map((s) => (
            <button
              key={s.value}
              onClick={() => setBrushSize(s.value)}
              className={cn(
                "flex h-9 w-9 items-center justify-center rounded-full border-2 text-xs font-bold transition-colors",
                brushSize === s.value
                  ? "border-[#4F7C57] bg-[#DDEED5] text-[#4F7C57]"
                  : "border-gray-200 bg-white text-[#2F2F2F] hover:border-[#DDEED5]"
              )}
            >
              {s.name}
            </button>
          ))}

          <div className="mx-2 h-6 w-px bg-gray-200" />

          {/* Eraser */}
          <button
            onClick={() => setIsEraser(!isEraser)}
            className={cn(
              "flex h-9 items-center gap-1 rounded-full border-2 px-3 text-xs font-bold transition-colors",
              isEraser
                ? "border-[#F4C95D] bg-[#F4C95D]/20 text-[#2F2F2F]"
                : "border-gray-200 bg-white text-[#2F2F2F] hover:border-[#F4C95D]"
            )}
          >
            Eraser
          </button>

          {/* Clear */}
          <button
            onClick={handleClear}
            className="flex h-9 items-center gap-1 rounded-full border-2 border-gray-200 bg-white px-3 text-xs font-bold text-[#2F2F2F] transition-colors hover:border-red-300 hover:bg-red-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Done button */}
      <div className="flex justify-center">
        <motion.div whileTap={{ scale: 0.95 }}>
          <Button
            onClick={handleSave}
            disabled={!hasDrawn}
            className="rounded-2xl bg-[#A8D08D] px-10 py-4 text-lg font-bold text-[#4F7C57] hover:bg-[#A8D08D]/80 disabled:opacity-40"
          >
            Done! ✨
          </Button>
        </motion.div>
      </div>
    </div>
  )
}
