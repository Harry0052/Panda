"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface LeafConfettiProps {
  active: boolean;
  duration?: number;
  className?: string;
}

const LEAF_COLORS = ["#A8D08D", "#4F7C57", "#DDEED5", "#78B860"];

function MiniLeaf({ color }: { color: string }) {
  return (
    <svg
      width="14"
      height="14"
      viewBox="0 0 14 14"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M2 12C2 12 3 4 10 2C10 2 9 8 4 11L2 12Z"
        fill={color}
      />
      <path
        d="M3 11.5C4.5 8 7 5 10 2"
        stroke={color}
        strokeWidth="0.5"
        opacity="0.6"
      />
    </svg>
  );
}

export function LeafConfetti({
  active,
  duration = 2,
  className,
}: LeafConfettiProps) {
  const leaves = useMemo(
    () =>
      Array.from({ length: 16 }, (_, i) => ({
        id: i,
        startX: -30 + Math.random() * 60,
        endX: -80 + Math.random() * 160,
        endY: 80 + Math.random() * 120,
        rotation: Math.random() * 720 - 360,
        delay: Math.random() * 0.4,
        color: LEAF_COLORS[i % LEAF_COLORS.length],
        swayAmount: 20 + Math.random() * 30,
      })),
    []
  );

  return (
    <div className={cn("pointer-events-none relative", className)}>
      <AnimatePresence>
        {active &&
          leaves.map((leaf) => (
            <motion.div
              key={leaf.id}
              className="absolute left-1/2 top-1/2"
              initial={{
                x: leaf.startX,
                y: 0,
                opacity: 1,
                rotate: 0,
                scale: 0,
              }}
              animate={{
                x: [
                  leaf.startX,
                  leaf.startX + leaf.swayAmount,
                  leaf.endX,
                ],
                y: [0, leaf.endY * 0.4, leaf.endY],
                opacity: [1, 1, 0],
                rotate: leaf.rotation,
                scale: [0, 1, 0.6],
              }}
              exit={{ opacity: 0 }}
              transition={{
                duration,
                delay: leaf.delay,
                ease: "easeOut",
              }}
            >
              <MiniLeaf color={leaf.color} />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
