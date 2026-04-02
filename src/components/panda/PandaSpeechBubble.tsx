import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

type Variant = "tip" | "encouragement" | "question" | "celebration";

interface PandaSpeechBubbleProps {
  children: ReactNode;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<
  Variant,
  { bg: string; border: string; text: string; tail: string }
> = {
  tip: {
    bg: "bg-[#DDEED5]",
    border: "border-[#A8D08D]",
    text: "text-[#4F7C57]",
    tail: "#DDEED5",
  },
  encouragement: {
    bg: "bg-[#F7F5EF]",
    border: "border-[#F4C95D]",
    text: "text-[#2F2F2F]",
    tail: "#F7F5EF",
  },
  question: {
    bg: "bg-[#E8F4FD]",
    border: "border-[#87CEEB]",
    text: "text-[#2F2F2F]",
    tail: "#E8F4FD",
  },
  celebration: {
    bg: "bg-[#FDF0F5]",
    border: "border-[#F5A6C0]",
    text: "text-[#2F2F2F]",
    tail: "#FDF0F5",
  },
};

const variantIcons: Record<Variant, string> = {
  tip: "\uD83C\uDF3F",
  encouragement: "\u2B50",
  question: "\uD83E\uDD14",
  celebration: "\uD83C\uDF89",
};

export function PandaSpeechBubble({
  children,
  variant = "tip",
  className,
}: PandaSpeechBubbleProps) {
  const styles = variantStyles[variant];
  const icon = variantIcons[variant];

  return (
    <div className={cn("relative inline-block", className)}>
      <div
        className={cn(
          "rounded-2xl border-2 px-4 py-3",
          styles.bg,
          styles.border,
          styles.text
        )}
      >
        <div className="flex items-start gap-2">
          <span className="shrink-0 text-lg" aria-hidden="true">
            {icon}
          </span>
          <div className="text-sm leading-relaxed">{children}</div>
        </div>
      </div>
      {/* Tail / pointer */}
      <svg
        className="absolute -bottom-3 left-6"
        width="20"
        height="12"
        viewBox="0 0 20 12"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-hidden="true"
      >
        <path d="M0 0L10 12L20 0" fill={styles.tail} />
        <path
          d="M0 0L10 12L20 0"
          stroke={styles.tail}
          strokeWidth="1"
          fill={styles.tail}
        />
      </svg>
    </div>
  );
}
