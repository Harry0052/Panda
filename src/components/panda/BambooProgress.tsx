"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BambooProgressProps {
  progress: number;
  height?: number;
  showPercentage?: boolean;
  className?: string;
}

export function BambooProgress({
  progress,
  height = 200,
  showPercentage = false,
  className,
}: BambooProgressProps) {
  const clampedProgress = Math.min(100, Math.max(0, progress));
  const fillHeight = (clampedProgress / 100) * height;
  const segmentCount = 5;
  const segmentSpacing = height / segmentCount;
  const stalkWidth = 28;
  const svgWidth = 44;
  const stalkX = (svgWidth - stalkWidth) / 2;

  return (
    <div
      className={cn("relative inline-flex flex-col items-center", className)}
      role="progressbar"
      aria-valuenow={clampedProgress}
      aria-valuemin={0}
      aria-valuemax={100}
    >
      <svg
        width={svgWidth}
        height={height}
        viewBox={`0 0 ${svgWidth} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        {/* Background stalk (empty) */}
        <rect
          x={stalkX}
          y={0}
          width={stalkWidth}
          height={height}
          rx={stalkWidth / 2}
          fill="#DDEED5"
        />

        {/* Filled portion (grows from bottom) */}
        <motion.rect
          x={stalkX}
          y={height - fillHeight}
          width={stalkWidth}
          height={fillHeight}
          rx={stalkWidth / 2}
          fill="#A8D08D"
          initial={{ height: 0, y: height }}
          animate={{ height: fillHeight, y: height - fillHeight }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Inner highlight */}
        <motion.rect
          x={stalkX + 10}
          y={height - fillHeight}
          width={4}
          height={fillHeight}
          rx={2}
          fill="#4F7C57"
          opacity={0.15}
          initial={{ height: 0, y: height }}
          animate={{ height: fillHeight, y: height - fillHeight }}
          transition={{ duration: 0.6, ease: "easeOut" }}
        />

        {/* Segment nodes */}
        {Array.from({ length: segmentCount - 1 }, (_, i) => {
          const y = segmentSpacing * (i + 1);
          return (
            <rect
              key={i}
              x={stalkX - 1}
              y={y - 2}
              width={stalkWidth + 2}
              height={4}
              rx={2}
              fill="#4F7C57"
              opacity={0.25}
            />
          );
        })}

        {/* Small leaves at top when progress > 80% */}
        {clampedProgress > 80 && (
          <motion.g
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ delay: 0.4, duration: 0.3 }}
          >
            <path
              d={`M${svgWidth / 2} 4 Q${svgWidth / 2 + 14} -8 ${svgWidth / 2 + 18} -2 Q${svgWidth / 2 + 10} 2 ${svgWidth / 2} 4Z`}
              fill="#4F7C57"
              opacity={0.7}
            />
            <path
              d={`M${svgWidth / 2} 4 Q${svgWidth / 2 - 12} -10 ${svgWidth / 2 - 16} -4 Q${svgWidth / 2 - 8} 1 ${svgWidth / 2} 4Z`}
              fill="#A8D08D"
              opacity={0.8}
            />
          </motion.g>
        )}
      </svg>

      {showPercentage && (
        <motion.span
          className="mt-2 text-sm font-semibold text-[#4F7C57]"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3 }}
        >
          {Math.round(clampedProgress)}%
        </motion.span>
      )}
    </div>
  );
}
