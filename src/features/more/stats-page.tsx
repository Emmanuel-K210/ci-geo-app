import type { ReactNode } from "react"

import { PageTitle, ProgressBar } from "@/components/ui"
import { ABIDJAN, geo, villes } from "@/geo"
import { cn } from "@/lib/cn"

function Bars({
  rows,
  orange,
}: {
  rows: [string, number][]
  orange?: boolean
}) {
  const max = Math.max(1, ...rows.map(([, value]) => value))
  return (
    <div className="flex flex-col gap-2">
      {rows.map(([name, value]) => (
        <div
          key={name}
          className="grid grid-cols-[110px_minmax(0,1fr)_32px] items-center gap-2.5 text-[13px] sm:grid-cols-[150px_minmax(0,1fr)_36px]"
        >
          <span className="truncate">{name}</span>
          <span className="h-2.5 rounded-full bg-land">
            <span
              className={cn(
                "block h-full rounded-full",
                orange ? "bg-orange" : "bg-green"
              )}
              style={{ width: `${(value / max) * 100}%` }}
            />
          </span>
          <span className="text-right font-mono text-xs text-muted tabular-nums">
            {value}
          </span>
        </div>
      ))}
    </div>
  )
}

function Block({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="flex flex-col gap-3 card p-4">
      <h2 className="eyebrow">{title}</h2>
      {children}
    </section>
  )
}

export function StatsPage() {
  const withQuartiers = villes.filter((ville) => ville.quartiers.length).length
  const others = villes.filter(
    (ville) => ville !== ABIDJAN && ville.quartiers.length
  )
  return (
    <div className="flex flex-col gap-4">
      <PageTitle
        eyebrow="Statistiques"
        title="Ce que contient le référentiel"
      />
      <div className="grid gap-4 lg:grid-cols-2">
        <Block title="Villes dont les quartiers sont renseignés">
          <p className="flex items-baseline gap-2">
            <span className="font-display text-4xl font-bold">
              {withQuartiers}/{villes.length}
            </span>
            <span className="text-sm text-muted">
              les autres restent en saisie libre
            </span>
          </p>
          <ProgressBar
            value={withQuartiers / villes.length}
            label="Villes avec quartiers"
          />
        </Block>
        <Block title="Régions par district">
          <Bars
            rows={geo.districts
              .filter((d) => !d.autonome)
              .map((d) => [d.nom, d.regions.length] as [string, number])
              .sort((a, b) => b[1] - a[1])}
          />
        </Block>
        <Block title="Quartiers par commune d'Abidjan">
          <Bars
            orange
            rows={ABIDJAN.localites
              .map((l) => [l.nom, l.quartiers.length] as [string, number])
              .sort((a, b) => b[1] - a[1])}
          />
        </Block>
        <Block title="Quartiers par ville (hors Abidjan)">
          <Bars
            rows={others
              .map((v) => [v.nom, v.quartiers.length] as [string, number])
              .sort((a, b) => b[1] - a[1])}
          />
        </Block>
      </div>
    </div>
  )
}
