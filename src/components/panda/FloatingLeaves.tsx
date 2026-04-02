"use client";

import { useEffect, useState } from "react";

interface Leaf {
  id: number;
  left: number;
  delay: number;
  duration: number;
  size: number;
  opacity: number;
  rotation: number;
}

function generateLeaves(count: number): Leaf[] {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    left: Math.random() * 100,
    delay: Math.random() * 8,
    duration: 10 + Math.random() * 8,
    size: 16 + Math.random() * 12,
    opacity: 0.15 + Math.random() * 0.25,
    rotation: Math.random() * 360,
  }));
}

function LeafSVG({ size, rotation }: { size: number; rotation: number }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      style={{ transform: `rotate(${rotation}deg)` }}
    >
      <path
        d="M17 8C8 10 5.9 16.17 3.82 21.34L5.71 22L6.66 19.7C7.14 19.87 7.64 20 8 20C19 20 22 3 22 3C21 5 14 5.25 9 6.25C4 7.25 2 11.5 2 13.5C2 15.5 3.75 17.25 3.75 17.25C7 8 17 8 17 8Z"
        fill="#4F7C57"
      />
    </svg>
  );
}

export function FloatingLeaves() {
  const [leaves, setLeaves] = useState<Leaf[]>([]);
  const [prefersReducedMotion, setPrefersReducedMotion] = useState(false);

  useEffect(() => {
    const mq = window.matchMedia("(prefers-reduced-motion: reduce)");
    setPrefersReducedMotion(mq.matches);

    const handler = (e: MediaQueryListEvent) =>
      setPrefersReducedMotion(e.matches);
    mq.addEventListener("change", handler);

    setLeaves(generateLeaves(7));

    return () => mq.removeEventListener("change", handler);
  }, []);

  if (prefersReducedMotion || leaves.length === 0) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 overflow-hidden"
      aria-hidden="true"
    >
      {leaves.map((leaf) => (
        <div
          key={leaf.id}
          className="animate-leaf-fall absolute"
          style={{
            left: `${leaf.left}%`,
            top: "-30px",
            opacity: leaf.opacity,
            animationDelay: `${leaf.delay}s`,
            animationDuration: `${leaf.duration}s`,
          }}
        >
          <LeafSVG size={leaf.size} rotation={leaf.rotation} />
        </div>
      ))}
    </div>
  );
}
