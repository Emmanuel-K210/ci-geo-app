import { Link, useNavigate } from "@tanstack/react-router"
import { ArrowLeftRight } from "lucide-react"

import { CountryMap, Route as RouteLine } from "@/components/country-map"
import type { CarteSearch } from "@/features/carte/search"
import { MapTabs } from "@/components/map-tabs"
import { Button, PageTitle } from "@/components/ui"
import {
  ABIDJAN,
  distanceKm,
  nearest,
  villeById,
  villes,
  type Ville,
} from "@/geo"
import { bearing, direction, towards } from "@/geo/compass"
import { cn } from "@/lib/cn"
import { coordinates, de, fmtKm, plural } from "@/lib/format"

const BOUAKE = villeById("ci-v-bouake")!

function CitySelect({
  label,
  value,
  onChange,
}: {
  label: string
  value: Ville
  onChange: (ville: Ville) => void
}) {
  return (
    <label className="flex min-w-0 flex-1 flex-col gap-1 text-xs font-medium text-muted">
      {label}
      <select
        value={value.id}
        onChange={(event) => onChange(villeById(event.target.value)!)}
        className="h-11 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-[15px] text-ink"
      >
        {villes.map((ville) => (
          <option key={ville.id} value={ville.id}>
            {ville.nom}
          </option>
        ))}
      </select>
    </label>
  )
}

export function CartePage({ search }: { search: CarteSearch }) {
  const navigate = useNavigate()
  const city = villeById(search.ville) ?? ABIDJAN
  const a = villeById(search.a) ?? ABIDJAN
  const b = villeById(search.b) ?? BOUAKE
  const update = (patch: Partial<CarteSearch>) =>
    void navigate({
      to: "/carte",
      search: { ville: city.id, a: a.id, b: b.id, ...patch },
      replace: true,
    })
  const km = distanceKm(a, b)

  return (
    <div className="flex flex-col gap-4">
      <MapTabs />
      <PageTitle eyebrow="Carte" title="Les villes à leur place">
        Touchez une ville pour l'ouvrir.
      </PageTitle>
      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.25fr)_minmax(0,1fr)]">
        <div className="card p-2">
          <CountryMap
            cityClass={(ville) => cn(ville === city && "on")}
            onCity={(ville) => update({ ville: ville.id })}
            under={<RouteLine from={a} to={b} />}
          />
          <p className="px-2 pt-1 pb-1.5 text-xs text-muted">
            Contour simplifié, positions arrondies à environ 1 km. Points orange
            : chefs-lieux.
          </p>
        </div>

        <div className="flex flex-col gap-4">
          <section className="flex flex-col gap-3 card p-4" aria-live="polite">
            <div>
              <p className="eyebrow text-orange">
                {city.region
                  ? `Région ${city.region.nom}`
                  : "District autonome"}
              </p>
              <h2 className="font-display text-[28px] leading-tight font-bold">
                {city.nom}
              </h2>
              <p className="text-xs text-muted">
                {coordinates(city)} ·{" "}
                {plural(city.quartiers.length, "quartier")}
              </p>
            </div>
            <div>
              <p className="mb-1 eyebrow">Les plus proches</p>
              {nearest(city).map(({ ville, km: distance }) => (
                <button
                  key={ville.id}
                  type="button"
                  onClick={() => update({ ville: ville.id })}
                  className="flex min-h-11 w-full items-center gap-3 border-b border-line text-left last:border-0"
                >
                  <span className="flex-1 font-medium">{ville.nom}</span>
                  <span className="font-mono text-xs text-muted">
                    {fmtKm(distance)} ·{" "}
                    {towards(direction(bearing(city, ville)))}
                  </span>
                </button>
              ))}
            </div>
            <div className="flex flex-wrap gap-2">
              <Link
                to="/atlas"
                search={{ ville: city.id }}
                className="inline-flex min-h-11 items-center rounded-full bg-land px-5 text-sm font-semibold"
              >
                Ouvrir dans l'atlas
              </Link>
              <Button variant="outline" onClick={() => update({ b: city.id })}>
                Distance jusqu'ici
              </Button>
            </div>
          </section>

          <section className="flex flex-col gap-3 card p-4">
            <p className="eyebrow">Distance à vol d'oiseau</p>
            <div className="flex items-end gap-2">
              <CitySelect
                label="Départ"
                value={a}
                onChange={(ville) => update({ a: ville.id })}
              />
              <button
                type="button"
                aria-label="Inverser départ et arrivée"
                onClick={() => update({ a: b.id, b: a.id })}
                className="grid size-11 flex-none place-items-center rounded-full bg-land"
              >
                <ArrowLeftRight className="size-4" aria-hidden />
              </button>
              <CitySelect
                label="Arrivée"
                value={b}
                onChange={(ville) => update({ b: ville.id })}
              />
            </div>
            <p>
              <span className="font-display text-4xl font-bold tracking-tight">
                {fmtKm(km)}
              </span>
            </p>
            <p className="text-sm text-muted">
              {a === b
                ? "Même ville."
                : `${b.nom} est ${towards(direction(bearing(a, b)))} ${de(a.nom)}. Par la route, comptez davantage.`}
            </p>
          </section>
        </div>
      </div>
    </div>
  )
}
