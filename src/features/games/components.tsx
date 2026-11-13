import { Link } from "@tanstack/react-router"
import { ChevronLeft, Share2 } from "lucide-react"
import { useEffect, useState, type ReactNode } from "react"

import { Button, Pill, ProgressBar } from "@/components/ui"
import { shareUrl } from "@/features/games/use-countdown"
import { cn } from "@/lib/cn"
import { shareOrCopy } from "@/lib/share"
import { levelOf } from "@/stores/levels"
import type { Outcome } from "@/stores/progress"

const reducedMotion = () =>
  window.matchMedia("(prefers-reduced-motion: reduce)").matches

/** Counts from 0 up to `target`, once, unless motion is reduced. */
function useCountUp(target: number, duration = 900) {
  const [value, setValue] = useState(() => (reducedMotion() ? target : 0))
  useEffect(() => {
    if (reducedMotion()) return
    let frame = 0
    const start = performance.now()
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      setValue(Math.round(target * (1 - (1 - t) ** 3)))
      if (t < 1) frame = requestAnimationFrame(tick)
    }
    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [target, duration])
  return value
}

/** The XP won, counted up, and the level bar filling from where it was. */
function XpGain({ outcome }: { outcome: Outcome }) {
  const gained = useCountUp(outcome.xp)
  const after = levelOf(outcome.xpBefore + outcome.xp)
  const before = levelOf(outcome.xpBefore)
  const [progress, setProgress] = useState(
    after.number > before.number ? 0 : before.progress
  )
  useEffect(() => {
    const frame = requestAnimationFrame(() => setProgress(after.progress))
    return () => cancelAnimationFrame(frame)
  }, [after.progress])

  return (
    <div className="flex items-center gap-3 rounded-2xl bg-land p-3">
      <span className="grid size-10 flex-none place-items-center rounded-full bg-orange font-display font-bold text-orange-ink">
        {after.number}
      </span>
      <div className="flex min-w-0 flex-1 flex-col gap-1.5">
        <div className="flex items-baseline justify-between gap-2">
          <span className="font-display text-sm font-semibold">
            {after.name}
          </span>
          <span className="font-mono text-sm font-semibold text-orange tabular-nums">
            +{gained} XP
          </span>
        </div>
        <div
          role="progressbar"
          aria-label="Vers le niveau suivant"
          aria-valuemin={0}
          aria-valuemax={100}
          aria-valuenow={Math.round(after.progress * 100)}
          className="h-2 overflow-hidden rounded-full bg-land-2"
        >
          <div
            className="h-full rounded-full bg-orange transition-[width] delay-300 duration-1000 ease-out"
            style={{ width: `${progress * 100}%` }}
          />
        </div>
      </div>
    </div>
  )
}

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
  share,
  children,
  actions,
}: {
  eyebrow: string
  big: ReactNode
  message: ReactNode
  detail?: ReactNode
  outcome: Outcome | null
  /** One line on the result (« Quiz Chefs-lieux : 8/10 ») adds a share button. */
  share?: string
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
      {outcome && outcome.xp > 0 && <XpGain outcome={outcome} />}
      {outcome && (outcome.record || outcome.newBadges.length > 0) && (
        <div className="flex flex-wrap gap-1.5">
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
      <div className="flex flex-wrap gap-2">
        {actions}
        {share && (
          <Button
            variant="outline"
            onClick={() =>
              void shareOrCopy(
                [`CI-Geo · ${share}`, shareUrl()].filter(Boolean).join("\n")
              )
            }
          >
            <Share2 className="size-4" aria-hidden />
            Partager
          </Button>
        )}
      </div>
    </section>
  )
}
