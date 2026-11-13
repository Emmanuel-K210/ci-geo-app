import { Link } from "@tanstack/react-router"
import { CalendarDays, Flame, Share2 } from "lucide-react"

import { buttonClass } from "@/components/button-class"
import { Button } from "@/components/ui"
import { dailyBestLabel } from "@/features/games/catalog"
import {
  dailyPoints,
  dailyStreak,
  DAILY_MAX,
  dayKey,
  shareText,
  square,
} from "@/features/games/daily"
import { shareUrl, useCountdown } from "@/features/games/use-countdown"
import { shareOrCopy } from "@/lib/share"
import { useProgress } from "@/stores/progress"

/** Today's challenge: the call to play, or the result to share. */
export function DailyCard() {
  const today = dayKey()
  const daily = useProgress((state) => state.daily)
  const best = useProgress((state) => state.best)
  const distances = daily[today]
  const streak = dailyStreak(Object.keys(daily), today)
  const countdown = useCountdown()

  return (
    <section className="relative overflow-hidden rounded-3xl bg-ink p-5 text-paper">
      <div
        aria-hidden
        className="absolute -top-10 -right-10 size-40 rounded-full bg-orange/25"
      />
      <div className="relative flex flex-col gap-3">
        <div className="flex items-center gap-2">
          <CalendarDays className="size-4 text-orange" aria-hidden />
          <p className="font-mono text-[11px] font-medium tracking-[0.08em] uppercase opacity-80">
            Défi du jour
          </p>
          {streak > 0 && (
            <span className="ml-auto inline-flex items-center gap-1 rounded-full bg-paper/10 px-2.5 py-1 font-mono text-xs">
              <Flame className="size-3.5 text-orange" aria-hidden />
              {streak} {streak > 1 ? "jours" : "jour"}
            </span>
          )}
        </div>
        {distances ? (
          <>
            <p className="font-display text-2xl font-bold">
              {distances.reduce((sum, km) => sum + dailyPoints(km), 0)} /{" "}
              {DAILY_MAX}
            </p>
            <p
              className="text-2xl tracking-widest"
              aria-label="Résultat par ville"
            >
              {distances.map(square).join("")}
            </p>
            <p className="text-sm opacity-80">Prochain défi dans {countdown}</p>
            <div className="flex flex-wrap gap-2">
              <Button
                variant="orange"
                onClick={() =>
                  void shareOrCopy(shareText(today, distances, shareUrl()))
                }
              >
                <Share2 className="size-4" aria-hidden />
                Partager
              </Button>
              <Link
                to="/jeux/du-jour"
                className={buttonClass("ghost", "bg-paper/10 text-paper")}
              >
                Revoir
              </Link>
            </div>
          </>
        ) : (
          <>
            <p className="font-display text-2xl leading-tight font-bold text-balance">
              5 villes à placer sur la carte, sans les noms.
            </p>
            <p className="text-sm opacity-80">
              Le même défi pour tout le monde aujourd'hui. Partagez votre score
              en carrés de couleur.
            </p>
            <Link
              to="/jeux/du-jour"
              className={buttonClass("orange", "self-start")}
            >
              Jouer le défi
            </Link>
          </>
        )}
        {dailyBestLabel(best) && (
          <p className="font-mono text-xs opacity-70">{dailyBestLabel(best)}</p>
        )}
      </div>
    </section>
  )
}
