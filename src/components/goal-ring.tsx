import type { ReactNode } from "react"

/** A ring that fills up with the daily goal, around its content. */
export function GoalRing({
  value,
  size = 44,
  stroke = 4,
  children,
}: {
  value: number
  size?: number
  stroke?: number
  children?: ReactNode
}) {
  const r = (size - stroke) / 2
  const length = 2 * Math.PI * r
  const done = Math.min(1, Math.max(0, value))
  return (
    <span
      className="relative grid flex-none place-items-center"
      style={{ width: size, height: size }}
    >
      <svg
        viewBox={`0 0 ${size} ${size}`}
        aria-hidden
        className="absolute inset-0 -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          className="stroke-land-2"
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={r}
          fill="none"
          strokeWidth={stroke}
          strokeLinecap="round"
          strokeDasharray={length}
          strokeDashoffset={length * (1 - done)}
          className={
            done >= 1
              ? "stroke-green transition-[stroke-dashoffset] duration-700"
              : "stroke-orange transition-[stroke-dashoffset] duration-700"
          }
        />
      </svg>
      {children}
    </span>
  )
}
