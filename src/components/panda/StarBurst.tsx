"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo } from "react";
import { cn } from "@/lib/utils";

interface StarBurstProps {
  active: boolean;
  count?: number;
  className?: string;
}

const STAR_COLORS = ["#F4C95D", "#F5A6C0", "#87CEEB", "#C4B5E0", "#A8D08D"];

function StarShape({ color, size }: { color: string; size: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <path
        d="M12 2L14.09 8.26L20.18 8.63L15.54 12.74L17.12 19.37L12 15.77L6.88 19.37L8.46 12.74L3.82 8.63L9.91 8.26L12 2Z"
        fill={color}
      />
    </svg>
  );
}

export function StarBurst({
  active,
  count = 8,
  className,
}: StarBurstProps) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => {
        const angle = (360 / count) * i;
        const radians = (angle * Math.PI) / 180;
        const distance = 40 + Math.random() * 30;
        return {
          id: i,
          x: Math.cos(radians) * distance,
          y: Math.sin(radians) * distance,
          rotation: Math.random() * 360,
          size: 10 + Math.random() * 10,
          color: STAR_COLORS[i % STAR_COLORS.length],
          delay: i * 0.04,
        };
      }),
    [count]
  );

  return (
    <div className={cn("pointer-events-none relative", className)}>
      <AnimatePresence>
        {active &&
          stars.map((star) => (
            <motion.div
              key={star.id}
              className="absolute left-1/2 top-1/2"
              initial={{
                x: 0,
                y: 0,
                scale: 0,
                opacity: 1,
                rotate: 0,
              }}
              animate={{
                x: star.x,
                y: star.y,
                scale: [0, 1.2, 0.8],
                opacity: [1, 1, 0],
                rotate: star.rotation,
              }}
              exit={{ opacity: 0, scale: 0 }}
              transition={{
                duration: 0.8,
                delay: star.delay,
                ease: "easeOut",
              }}
              style={{ marginLeft: -star.size / 2, marginTop: -star.size / 2 }}
            >
              <StarShape color={star.color} size={star.size} />
            </motion.div>
          ))}
      </AnimatePresence>
    </div>
  );
}
