"use client";

import { motion } from "framer-motion";
import type { DiagramElement } from "@/lib/lesson-schema";

function getColor(color?: string): string {
  const palette: Record<string, string> = {
    green: "#4F7C57",
    bamboo: "#A8D08D",
    gold: "#F4C95D",
    pink: "#F5A6C0",
    sky: "#87CEEB",
    lavender: "#C4B5E0",
    cream: "#F7F5EF",
    charcoal: "#2F2F2F",
    mist: "#DDEED5",
    orange: "#F97316",
    red: "#EF4444",
    blue: "#3B82F6",
    purple: "#A855F7",
  };
  return palette[color || ""] || color || "#4F7C57";
}

function BoxElement({ el, delay }: { el: DiagramElement; delay: number }) {
  const bg = getColor(el.color);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4 }}
      className="absolute flex items-center justify-center rounded-xl border-2 shadow-sm"
      style={{
        left: el.x,
        top: el.y,
        width: el.width || 120,
        height: el.height || 60,
        backgroundColor: bg + "22",
        borderColor: bg,
      }}
    >
      {el.stepNumber !== undefined && (
        <span
          className="absolute -top-3 -left-3 w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: bg }}
        >
          {el.stepNumber}
        </span>
      )}
      {el.text && (
        <span
          className="text-center font-medium px-2 leading-tight"
          style={{ fontSize: el.fontSize || 14, color: "#2F2F2F" }}
        >
          {el.text}
        </span>
      )}
    </motion.div>
  );
}

function CircleElement({ el, delay }: { el: DiagramElement; delay: number }) {
  const bg = getColor(el.color);
  const size = el.width || 80;
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.4, type: "spring" }}
      className="absolute flex items-center justify-center rounded-full border-2 shadow-sm"
      style={{
        left: el.x - size / 2,
        top: el.y - size / 2,
        width: size,
        height: size,
        backgroundColor: bg + "22",
        borderColor: bg,
      }}
    >
      {el.stepNumber !== undefined && (
        <span
          className="absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-bold"
          style={{ backgroundColor: bg }}
        >
          {el.stepNumber}
        </span>
      )}
      {el.text && (
        <span
          className="text-center font-medium px-1 leading-tight"
          style={{ fontSize: el.fontSize || 12, color: "#2F2F2F" }}
        >
          {el.text}
        </span>
      )}
    </motion.div>
  );
}

function ArrowElement({ el, delay }: { el: DiagramElement; delay: number }) {
  const fromX = el.x;
  const fromY = el.y;
  const toX = el.toX ?? el.x + 100;
  const toY = el.toY ?? el.y;
  const color = getColor(el.color);

  const dx = toX - fromX;
  const dy = toY - fromY;
  const angle = Math.atan2(dy, dx);
  const length = Math.sqrt(dx * dx + dy * dy);

  // Arrow head
  const headLen = 10;
  const headX1 = toX - headLen * Math.cos(angle - 0.4);
  const headY1 = toY - headLen * Math.sin(angle - 0.4);
  const headX2 = toX - headLen * Math.cos(angle + 0.4);
  const headY2 = toY - headLen * Math.sin(angle + 0.4);

  return (
    <motion.g
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ delay, duration: 0.3 }}
    >
      <line
        x1={fromX}
        y1={fromY}
        x2={toX}
        y2={toY}
        stroke={color}
        strokeWidth={2.5}
        strokeLinecap="round"
      />
      <polygon
        points={`${toX},${toY} ${headX1},${headY1} ${headX2},${headY2}`}
        fill={color}
      />
      {el.text && (
        <text
          x={(fromX + toX) / 2}
          y={(fromY + toY) / 2 - 8}
          textAnchor="middle"
          fill="#6B7280"
          fontSize={el.fontSize || 11}
          fontWeight="500"
        >
          {el.text}
        </text>
      )}
    </motion.g>
  );
}

function LabelElement({ el, delay }: { el: DiagramElement; delay: number }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 5 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay, duration: 0.3 }}
      className="absolute"
      style={{ left: el.x, top: el.y }}
    >
      <span
        className="font-semibold"
        style={{ fontSize: el.fontSize || 13, color: getColor(el.color) || "#2F2F2F" }}
      >
        {el.text}
      </span>
    </motion.div>
  );
}

function CalloutElement({ el, delay }: { el: DiagramElement; delay: number }) {
  const bg = getColor(el.color);
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ delay, duration: 0.3 }}
      className="absolute rounded-lg px-3 py-2 border-2 shadow-md"
      style={{
        left: el.x,
        top: el.y,
        backgroundColor: "#FFFFFF",
        borderColor: bg,
        maxWidth: el.width || 180,
      }}
    >
      <span className="text-sm text-[#2F2F2F]">{el.text}</span>
      {/* Pointer triangle */}
      <div
        className="absolute -bottom-2 left-4 w-4 h-4 rotate-45 border-b-2 border-r-2"
        style={{ backgroundColor: "#FFFFFF", borderColor: bg }}
      />
    </motion.div>
  );
}

export function DiagramRenderer({
  elements,
  width = 500,
  height = 400,
  className,
}: {
  elements: DiagramElement[];
  width?: number;
  height?: number;
  className?: string;
}) {
  const arrows = elements.filter((e) => e.shape === "arrow");
  const others = elements.filter((e) => e.shape !== "arrow");

  return (
    <div
      className={`relative bg-white rounded-2xl border-2 border-[#E5E2DA] overflow-hidden ${className || ""}`}
      style={{ width: "100%", maxWidth: width, height, margin: "0 auto" }}
    >
      {/* SVG layer for arrows */}
      <svg className="absolute inset-0 w-full h-full pointer-events-none" style={{ width, height }}>
        {arrows.map((el, i) => (
          <ArrowElement key={el.id} el={el} delay={i * 0.15} />
        ))}
      </svg>

      {/* HTML layer for boxes, circles, labels, callouts */}
      {others.map((el, i) => {
        const delay = (arrows.length + i) * 0.1;
        switch (el.shape) {
          case "box":
            return <BoxElement key={el.id} el={el} delay={delay} />;
          case "circle":
            return <CircleElement key={el.id} el={el} delay={delay} />;
          case "label":
            return <LabelElement key={el.id} el={el} delay={delay} />;
          case "callout":
            return <CalloutElement key={el.id} el={el} delay={delay} />;
          default:
            return null;
        }
      })}
    </div>
  );
}
