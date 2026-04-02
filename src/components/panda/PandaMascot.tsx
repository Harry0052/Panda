"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

type Expression =
  | "happy"
  | "thinking"
  | "celebrating"
  | "waving"
  | "sleeping"
  | "encouraging";

type Size = "sm" | "md" | "lg" | "xl";

interface PandaMascotProps {
  expression?: Expression;
  size?: Size;
  className?: string;
  animate?: boolean;
}

const sizeMap: Record<Size, number> = {
  sm: 64,
  md: 96,
  lg: 128,
  xl: 192,
};

function Eyes({ expression }: { expression: Expression }) {
  switch (expression) {
    case "sleeping":
      return (
        <g>
          {/* Closed eyes - curved lines */}
          <path
            d="M38 52 Q42 56 46 52"
            stroke="#2F2F2F"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M54 52 Q58 56 62 52"
            stroke="#2F2F2F"
            strokeWidth="2"
            strokeLinecap="round"
            fill="none"
          />
          {/* Zzz */}
          <text
            x="68"
            y="38"
            fontSize="8"
            fontWeight="bold"
            fill="#4F7C57"
            opacity="0.7"
          >
            z
          </text>
          <text
            x="74"
            y="32"
            fontSize="6"
            fontWeight="bold"
            fill="#4F7C57"
            opacity="0.5"
          >
            z
          </text>
        </g>
      );
    case "thinking":
      return (
        <g>
          {/* Looking up-right eyes */}
          <ellipse cx="42" cy="50" rx="4.5" ry="5" fill="white" />
          <ellipse cx="58" cy="50" rx="4.5" ry="5" fill="white" />
          <circle cx="43.5" cy="48" r="2.5" fill="#2F2F2F" />
          <circle cx="59.5" cy="48" r="2.5" fill="#2F2F2F" />
          <circle cx="44" cy="47.5" r="0.8" fill="white" />
          <circle cx="60" cy="47.5" r="0.8" fill="white" />
        </g>
      );
    case "celebrating":
      return (
        <g>
          {/* Excited squinting happy eyes */}
          <path
            d="M37 51 Q42 46 47 51"
            stroke="#2F2F2F"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M53 51 Q58 46 63 51"
            stroke="#2F2F2F"
            strokeWidth="2.5"
            strokeLinecap="round"
            fill="none"
          />
          {/* Sparkle near eyes */}
          <circle cx="32" cy="44" r="1.5" fill="#F4C95D" />
          <circle cx="68" cy="44" r="1.5" fill="#F4C95D" />
        </g>
      );
    default:
      return (
        <g>
          {/* Standard round eyes */}
          <ellipse cx="42" cy="51" rx="4.5" ry="5" fill="white" />
          <ellipse cx="58" cy="51" rx="4.5" ry="5" fill="white" />
          <circle cx="42" cy="51" r="2.5" fill="#2F2F2F" />
          <circle cx="58" cy="51" r="2.5" fill="#2F2F2F" />
          <circle cx="43" cy="50" r="0.8" fill="white" />
          <circle cx="59" cy="50" r="0.8" fill="white" />
        </g>
      );
  }
}

function Mouth({ expression }: { expression: Expression }) {
  switch (expression) {
    case "happy":
    case "encouraging":
      return (
        <path
          d="M44 60 Q50 66 56 60"
          stroke="#2F2F2F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      );
    case "celebrating":
      return (
        <ellipse cx="50" cy="62" rx="5" ry="3.5" fill="#2F2F2F" />
      );
    case "thinking":
      return (
        <circle cx="53" cy="61" r="2" fill="#2F2F2F" />
      );
    case "sleeping":
      return (
        <ellipse cx="50" cy="61" rx="3" ry="2" fill="#F5A6C0" opacity="0.6" />
      );
    case "waving":
      return (
        <path
          d="M44 60 Q50 65 56 60"
          stroke="#2F2F2F"
          strokeWidth="2"
          strokeLinecap="round"
          fill="none"
        />
      );
    default:
      return (
        <path
          d="M44 60 Q50 64 56 60"
          stroke="#2F2F2F"
          strokeWidth="1.8"
          strokeLinecap="round"
          fill="none"
        />
      );
  }
}

function Cheeks({ expression }: { expression: Expression }) {
  if (expression === "sleeping") return null;
  return (
    <g opacity="0.5">
      <ellipse cx="34" cy="57" rx="4" ry="2.5" fill="#F5A6C0" />
      <ellipse cx="66" cy="57" rx="4" ry="2.5" fill="#F5A6C0" />
    </g>
  );
}

function WavingArm() {
  return (
    <motion.g
      animate={{ rotate: [0, 15, -5, 15, 0] }}
      transition={{ duration: 1.2, repeat: Infinity, repeatDelay: 1.5 }}
      style={{ originX: "72px", originY: "70px" }}
    >
      <ellipse
        cx="78"
        cy="62"
        rx="6"
        ry="4"
        fill="white"
        stroke="#E0E0E0"
        strokeWidth="0.5"
        transform="rotate(-30 78 62)"
      />
    </motion.g>
  );
}

export function PandaMascot({
  expression = "happy",
  size = "md",
  className,
  animate = true,
}: PandaMascotProps) {
  const dimension = sizeMap[size];

  const bobAnimation = animate
    ? {
        y: [0, -3, 0],
        transition: {
          duration: 2.5,
          repeat: Infinity,
          ease: "easeInOut" as const,
        },
      }
    : {};

  return (
    <motion.div
      className={cn("inline-flex items-center justify-center", className)}
      animate={bobAnimation}
    >
      <svg
        width={dimension}
        height={dimension}
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        role="img"
        aria-label={`Panda mascot with ${expression} expression`}
      >
        {/* Left ear */}
        <circle cx="30" cy="25" r="12" fill="#2F2F2F" />
        <circle cx="30" cy="25" r="7" fill="#4a4a4a" />

        {/* Right ear */}
        <circle cx="70" cy="25" r="12" fill="#2F2F2F" />
        <circle cx="70" cy="25" r="7" fill="#4a4a4a" />

        {/* Head */}
        <ellipse cx="50" cy="52" rx="30" ry="28" fill="white" />

        {/* Eye patches */}
        <ellipse
          cx="40"
          cy="49"
          rx="10"
          ry="9"
          fill="#2F2F2F"
          transform="rotate(-8 40 49)"
        />
        <ellipse
          cx="60"
          cy="49"
          rx="10"
          ry="9"
          fill="#2F2F2F"
          transform="rotate(8 60 49)"
        />

        <Eyes expression={expression} />
        <Mouth expression={expression} />

        {/* Nose */}
        <ellipse cx="50" cy="57" rx="3" ry="2" fill="#2F2F2F" />

        <Cheeks expression={expression} />

        {expression === "waving" && <WavingArm />}

        {expression === "encouraging" && (
          <g>
            {/* Thumbs up arm */}
            <ellipse
              cx="22"
              cy="68"
              rx="5"
              ry="3.5"
              fill="white"
              stroke="#E0E0E0"
              strokeWidth="0.5"
            />
            <path
              d="M20 65 L18 60 L20 60 L20 65"
              fill="white"
              stroke="#E0E0E0"
              strokeWidth="0.5"
            />
          </g>
        )}
      </svg>
    </motion.div>
  );
}
