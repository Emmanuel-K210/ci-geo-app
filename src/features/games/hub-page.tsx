import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"

import { PageTitle } from "@/components/ui"
import { GAMES } from "@/features/games/catalog"
import { DailyCard } from "@/features/games/daily-card"
import { useProgress } from "@/stores/progress"

export function HubPage() {
  const best = useProgress((state) => state.best)
  return (
    <div className="flex flex-col gap-4">
      <PageTitle eyebrow="Jeux" title="Jouer avec la carte" />
      <DailyCard />
      <div className="grid gap-2.5 sm:grid-cols-2">
        {GAMES.map((game) => (
          <Link
            key={game.id}
            to={game.to}
            className="flex items-center gap-3.5 card p-4 transition-transform active:scale-[0.98]"
          >
            <span className="grid size-12 flex-none place-items-center rounded-2xl bg-green-soft text-green">
              <game.icon className="size-6" aria-hidden />
            </span>
            <span className="flex min-w-0 flex-1 flex-col gap-0.5">
              <span className="font-display font-semibold">{game.title}</span>
              <span className="text-[13px] leading-snug text-muted">
                {game.description}
              </span>
              {game.best(best) && (
                <span className="font-mono text-[11px] text-orange">
                  {game.best(best)}
                </span>
              )}
            </span>
            <ChevronRight className="size-5 flex-none text-muted" aria-hidden />
          </Link>
        ))}
      </div>
    </div>
  )
}
