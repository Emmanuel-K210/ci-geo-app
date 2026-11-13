import { Link } from "@tanstack/react-router"
import { ChevronRight } from "lucide-react"

import { PageTitle, ProgressBar } from "@/components/ui"
import { GROUPES, peuplesDe } from "@/culture/peuples"
import { SITES } from "@/culture/sites"
import { STORIES, storyOfTheDay } from "@/culture/stories"
import { dayKey } from "@/features/games/daily"
import { SectionTitle, StoryCard } from "@/features/decouvrir/components"
import { useProgress } from "@/stores/progress"

const FEATURED = 6

export function DecouvrirPage() {
  const read = useProgress((state) => state.read)
  const today = storyOfTheDay(dayKey())
  const sites = STORIES.filter(
    (story) => story.kind === "site" && story.key !== today.key
  ).slice(0, FEATURED)

  return (
    <div className="flex flex-col gap-5">
      <PageTitle eyebrow="Découvrir" title="Peuples, histoires et sites">
        L'histoire des peuples de Côte d'Ivoire et les lieux à voir, avec les
        récits qui vont avec.
      </PageTitle>

      <div className="flex items-center gap-3">
        <ProgressBar
          value={read.length / STORIES.length}
          label="Récits lus"
          className="flex-1"
        />
        <span className="font-mono text-xs text-muted tabular-nums">
          {read.length}/{STORIES.length} récits lus
        </span>
      </div>

      <section className="flex flex-col gap-2.5">
        <SectionTitle title="Le récit du jour" />
        <StoryCard story={today} size="lg" />
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle title="Les peuples" />
        <p className="-mt-1 text-sm text-muted">
          Plus de soixante peuples, en cinq grands groupes de langues.
        </p>
        <div className="grid gap-2.5 sm:grid-cols-2">
          {GROUPES.map((groupe) => {
            const peuples = peuplesDe(groupe.id)
            const done = peuples.filter((peuple) =>
              read.includes(`peuple:${peuple.id}`)
            ).length
            return (
              <Link
                key={groupe.id}
                to="/decouvrir/groupes/$id"
                params={{ id: groupe.id }}
                className="flex flex-col gap-2 card p-4 transition-transform active:scale-[0.98]"
              >
                <span className="flex items-baseline justify-between gap-2">
                  <span className="font-display text-lg font-semibold">
                    {groupe.nom}
                  </span>
                  <span className="font-mono text-[11px] text-muted">
                    {done}/{peuples.length}
                  </span>
                </span>
                <span className="text-[13px] text-muted">{groupe.aire}</span>
                <span className="flex flex-wrap gap-1.5">
                  {peuples.map((peuple) => (
                    <span
                      key={peuple.id}
                      className={
                        read.includes(`peuple:${peuple.id}`)
                          ? "rounded-full bg-green-soft px-2.5 py-0.5 text-[12px] font-medium text-green"
                          : "rounded-full bg-land px-2.5 py-0.5 text-[12px] font-medium"
                      }
                    >
                      {peuple.nom}
                    </span>
                  ))}
                </span>
              </Link>
            )
          })}
        </div>
      </section>

      <section className="flex flex-col gap-2.5">
        <SectionTitle title="Sites à visiter">
          <Link
            to="/decouvrir/sites"
            className="inline-flex min-h-11 items-center gap-0.5 text-sm font-medium text-green"
          >
            Les {SITES.length} sites
            <ChevronRight className="size-4" aria-hidden />
          </Link>
        </SectionTitle>
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
          {sites.map((story) => (
            <StoryCard key={story.key} story={story} />
          ))}
        </div>
      </section>
    </div>
  )
}
