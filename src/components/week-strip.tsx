import { Check } from "lucide-react"

import { dayKey, recentDays } from "@/features/games/daily"
import { cn } from "@/lib/cn"
import { useProgress } from "@/stores/progress"

const weekday = (key: string) =>
  new Date(`${key}T12:00:00Z`)
    .toLocaleDateString("fr-FR", { weekday: "narrow", timeZone: "UTC" })
    .toUpperCase()

/** The last seven days: a tick when the daily challenge was played. */
export function WeekStrip({ className }: { className?: string }) {
  const daily = useProgress((state) => state.daily)
  const today = dayKey()
  const days = recentDays(7, today)
  const count = days.filter((key) => daily[key]).length
  return (
    <ol
      className={cn("grid grid-cols-7 gap-1.5", className)}
      aria-label={`Défi du jour joué ${count} jours sur les 7 derniers`}
    >
      {days.map((key) => {
        const done = !!daily[key]
        const isToday = key === today
        return (
          <li key={key} className="flex flex-col items-center gap-1">
            <span
              className={cn(
                "grid size-8 place-items-center rounded-full border-2",
                done
                  ? "border-orange bg-orange text-orange-ink"
                  : isToday
                    ? "border-dashed border-orange text-orange"
                    : "border-line text-muted"
              )}
            >
              {done && <Check className="size-4" strokeWidth={3} aria-hidden />}
            </span>
            <span
              className={cn(
                "font-mono text-[10px]",
                isToday ? "font-semibold text-ink" : "text-muted"
              )}
            >
              {weekday(key)}
            </span>
          </li>
        )
      })}
    </ol>
  )
}
