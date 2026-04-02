import { cn } from "@/lib/utils";

interface BambooDecorProps {
  side: "left" | "right";
  height?: number;
  className?: string;
}

function BambooStalk({
  x,
  stalkHeight,
  segmentCount,
}: {
  x: number;
  stalkHeight: number;
  segmentCount: number;
}) {
  const segmentHeight = stalkHeight / segmentCount;

  return (
    <g>
      {/* Main stalk */}
      <rect
        x={x}
        y={0}
        width={12}
        height={stalkHeight}
        rx={6}
        fill="#A8D08D"
      />
      {/* Darker center line */}
      <rect
        x={x + 5}
        y={0}
        width={2}
        height={stalkHeight}
        fill="#4F7C57"
        opacity={0.2}
      />
      {/* Segment nodes */}
      {Array.from({ length: segmentCount - 1 }, (_, i) => {
        const y = segmentHeight * (i + 1);
        return (
          <g key={i}>
            <rect
              x={x - 1}
              y={y - 2}
              width={14}
              height={4}
              rx={2}
              fill="#4F7C57"
              opacity={0.35}
            />
          </g>
        );
      })}
      {/* Small leaf branches on alternating nodes */}
      {Array.from({ length: segmentCount - 1 }, (_, i) => {
        if (i % 2 !== 0) return null;
        const y = segmentHeight * (i + 1);
        const flipX = i % 4 === 0 ? 1 : -1;
        return (
          <g
            key={`leaf-${i}`}
            transform={`translate(${x + 6}, ${y}) scale(${flipX}, 1)`}
          >
            <path
              d="M0 0 Q12 -8 20 -3 Q12 -1 0 0Z"
              fill="#4F7C57"
              opacity={0.5}
            />
            <path
              d="M0 0 Q10 -12 18 -8 Q10 -5 0 0Z"
              fill="#A8D08D"
              opacity={0.6}
            />
          </g>
        );
      })}
    </g>
  );
}

export function BambooDecor({
  side,
  height = 400,
  className,
}: BambooDecorProps) {
  const width = 60;
  const isRight = side === "right";

  return (
    <div
      className={cn(
        "pointer-events-none absolute top-0 bottom-0",
        isRight ? "right-0" : "left-0",
        className
      )}
      aria-hidden="true"
    >
      <svg
        width={width}
        height={height}
        viewBox={`0 0 ${width} ${height}`}
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className={cn(isRight && "scale-x-[-1]")}
      >
        <BambooStalk x={8} stalkHeight={height} segmentCount={6} />
        <BambooStalk x={28} stalkHeight={height * 0.75} segmentCount={5} />
        <BambooStalk x={44} stalkHeight={height * 0.5} segmentCount={4} />
      </svg>
    </div>
  );
}
