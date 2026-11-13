import { Link } from "@tanstack/react-router"
import { ChevronLeft } from "lucide-react"
import { useEffect, type ReactNode } from "react"

import { Pill, ProgressBar } from "@/components/ui"
import { cn } from "@/lib/cn"
import type { Outcome } from "@/stores/progress"

export function GameLayout({
  title,
  children,
}: {
  title: string
  children: ReactNode
}) {
  return (
    <div className="mx-auto flex max-w-2xl flex-col gap-4">
      <div className="flex items-center gap-2">
        <Link
          to="/jeux"
          className="-ml-2 inline-flex min-h-11 items-center gap-1 rounded-full pr-3 pl-2 text-sm font-medium text-muted hover:text-ink"
        >
          <ChevronLeft className="size-5" aria-hidden />
          Jeux
        </Link>
        <h1 className="ml-auto font-display text-base font-semibold">
          {title}
        </h1>
      </div>
      {children}
    </div>
  )
}

export function GameTop({
  step,
  total,
  children,
}: {
  step: number
  total: number
  children?: ReactNode
}) {
  return (
    <div className="flex items-center gap-3">
      <ProgressBar
        value={step / total}
        label="Progression"
        className="flex-1"
      />
      <span className="font-mono text-xs text-muted tabular-nums">
        {children}
      </span>
    </div>
  )
}

export function QuestionText({
  type,
  children,
}: {
  type: string
  children: ReactNode
}) {
  return (
    <div className="animate-pop">
      <p className="eyebrow text-green">{type}</p>
      <h2 className="font-display text-[22px] leading-tight font-semibold tracking-tight text-balance sm:text-[26px]">
        {children}
      </h2>
    </div>
  )
}

/** Four answers, one per row on phones; keys 1 to 4 on a keyboard. */
export function AnswerGrid({
  options,
  good,
  answered,
  onAnswer,
}: {
  options: string[]
  good?: string
  answered?: string | null
  onAnswer: (option: string) => void
}) {
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      if (answered || target.closest("input, select, textarea")) return
      const index = Number(event.key) - 1
      if (index >= 0 && index < options.length) onAnswer(options[index])
    }
    document.addEventListener("keydown", onKey)
    return () => document.removeEventListener("keydown", onKey)
  }, [answered, onAnswer, options])

  return (
    <div className="grid gap-2.5 sm:grid-cols-2">
      {options.map((option, index) => {
        const isGood = !!answered && option === good
        const isBad = !!answered && option === answered && option !== good
        return (
          <button
            key={option}
            type="button"
            disabled={!!answered}
            onClick={() => onAnswer(option)}
            className={cn(
              "flex min-h-14 items-center gap-3 rounded-2xl border px-4 text-left text-[15px] font-medium transition-transform active:scale-[0.98] disabled:active:scale-100",
              isGood
                ? "animate-pop border-green bg-green-soft"
                : isBad
                  ? "animate-shake border-orange bg-warn-bg"
                  : "border-line bg-surface",
              !answered && "hover:border-green hover:bg-green-soft"
            )}
          >
            <kbd
              className={cn(
                "grid size-6 flex-none place-items-center rounded-md bg-land font-mono text-xs text-muted",
                isGood && "bg-green text-surface",
                isBad && "bg-orange text-orange-ink"
              )}
            >
              {index + 1}
            </kbd>
            {option}
          </button>
        )
      })}
    </div>
  )
}

export function Feedback({
  ok,
  children,
}: {
  ok: boolean
  children: ReactNode
}) {
  return (
    <p
      className={cn(
        "animate-pop rounded-2xl p-3.5 text-sm",
        ok ? "bg-green-soft" : "bg-warn-bg text-warn-fg"
      )}
    >
      {children}
    </p>
  )
}

export function ResultView({
  eyebrow,
  big,
  message,
  detail,
  outcome,
  children,
  actions,
}: {
  eyebrow: string
  big: ReactNode
  message: ReactNode
  detail?: ReactNode
  outcome: Outcome | null
  children?: ReactNode
  actions: ReactNode
}) {
  return (
    <section className="animate-pop flex flex-col gap-4 card p-5">
      <p className="eyebrow text-green">{eyebrow}</p>
      <div className="flex flex-wrap items-center gap-x-5 gap-y-2">
        <div className="font-display text-[56px] leading-none font-bold tracking-tight">
          {big}
        </div>
        <div className="min-w-48 flex-1">
          <p className="font-display text-xl leading-snug font-semibold text-balance">
            {message}
          </p>
          {detail && <p className="text-sm text-muted">{detail}</p>}
        </div>
      </div>
      {outcome && (
        <div className="flex flex-wrap gap-1.5">
          {outcome.xp > 0 && <Pill tone="orange">+{outcome.xp} XP</Pill>}
          {outcome.record && <Pill tone="green">Nouveau record</Pill>}
          {outcome.newBadges.map((badge) => (
            <Pill key={badge.id} tone="green">
              <badge.icon className="size-3" aria-hidden />
              {badge.title}
            </Pill>
          ))}
        </div>
      )}
      {children}
      <div className="flex flex-wrap gap-2">{actions}</div>
    </section>
  )
}
