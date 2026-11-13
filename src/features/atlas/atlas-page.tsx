import { Link, useNavigate } from "@tanstack/react-router"
import { Copy, Shuffle } from "lucide-react"
import { useEffect, useRef, useState } from "react"
import { toast } from "sonner"

import type { AtlasSearch } from "@/features/atlas/search"
import { CountryMap } from "@/components/country-map"
import { MapTabs } from "@/components/map-tabs"
import { Button, Empty, Pill } from "@/components/ui"
import {
  ABIDJAN,
  districtById,
  geo,
  localiteById,
  nearest,
  villeById,
  villeKind,
  villes,
  type Ville,
} from "@/geo"
import { cn } from "@/lib/cn"
import { burst } from "@/lib/feedback"
import { coordinates, fmtKm, plural } from "@/lib/format"
import { pick } from "@/lib/random"
import { copyText } from "@/lib/share"
import { useProgress } from "@/stores/progress"

/** m1 to m3: how many of the district's cities were opened. */
function masteryClass(districtId: string, visited: string[]) {
  const item = districtById(districtId)
  if (!item?.villes.length) return ""
  const share =
    item.villes.filter((v) => visited.includes(v.id)).length /
    item.villes.length
  return share >= 1 ? "m3" : share >= 0.5 ? "m2" : share > 0 ? "m1" : ""
}

const QUARTIERS_PREVIEW = 24

const isPhone = () => window.matchMedia("(max-width: 1023px)").matches

function Dot({ ville }: { ville: Ville }) {
  return (
    <span
      className={cn(
        "size-2.5 flex-none rounded-full border-2 border-green",
        ville.chefLieuDe && "border-orange bg-orange"
      )}
    />
  )
}

function CityRow({ ville, meta }: { ville: Ville; meta?: string }) {
  const count = ville.quartiers.length
  return (
    <Link
      to="/atlas"
      search={{ ville: ville.id }}
      className="flex min-h-12 items-center gap-3 border-b border-line px-1 last:border-0 hover:text-green"
    >
      <Dot ville={ville} />
      <span className="min-w-0 flex-1 font-medium">{ville.nom}</span>
      <span className="font-mono text-xs text-muted tabular-nums">
        {meta ?? (count ? plural(count, "quartier") : "—")}
      </span>
    </Link>
  )
}

function SectionLabel({ children }: { children: string }) {
  return <p className="mb-2 eyebrow">{children}</p>
}

export function AtlasPage({ search }: { search: AtlasSearch }) {
  const navigate = useNavigate()
  const panel = useRef<HTMLDivElement>(null)
  const visit = useProgress((state) => state.visit)
  const devMode = useProgress((state) => state.settings.devMode)
  const visited = useProgress((state) => state.visited)

  const ville =
    villeById(search.ville) ?? (search.district ? undefined : ABIDJAN)
  const district =
    ville?.district ?? districtById(search.district) ?? ABIDJAN.district
  const candidate = localiteById(search.localite)
  const localite = ville && candidate?.ville === ville ? candidate : undefined
  const [expandedFor, setExpandedFor] = useState<string | null>(null)
  const listKey = `${ville?.id}/${localite?.id}`
  const shownQuartiers = ville
    ? localite
      ? localite.quartiers
      : ville.quartiers
    : []
  const visibleQuartiers =
    expandedFor === listKey
      ? shownQuartiers
      : shownQuartiers.slice(0, QUARTIERS_PREVIEW)

  useEffect(() => {
    if (!ville) return
    for (const badge of visit(ville.id)) {
      burst()
      toast.success(`Badge débloqué : ${badge.title}`, {
        description: badge.description,
      })
    }
  }, [ville, visit])

  const reveal = () => {
    if (isPhone())
      requestAnimationFrame(() =>
        panel.current?.scrollIntoView({ behavior: "smooth", block: "start" })
      )
  }

  const randomCity = () => {
    void navigate({ to: "/atlas", search: { ville: pick(villes).id } })
    reveal()
  }

  return (
    <div className="flex flex-col gap-4">
      <MapTabs />
      <div className="flex items-end justify-between gap-3">
        <div>
          <p className="eyebrow text-green">Atlas</p>
          <h1 className="font-display text-[26px] leading-tight font-bold tracking-tight">
            Côte d'Ivoire
          </h1>
        </div>
        <Button variant="ghost" onClick={randomCity}>
          <Shuffle className="size-4" aria-hidden />
          Au hasard
        </Button>
      </div>

      <div className="grid items-start gap-4 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
        <div className="overflow-hidden card p-2 sm:p-3">
          <CountryMap
            labelled={district.villes}
            muted
            snapKm={12}
            cityClass={(item) =>
              cn(
                item === ville && "on",
                item.district === district && item !== ville && "good"
              )
            }
            districtClass={(id) =>
              id === district.id ? "on" : masteryClass(id, visited)
            }
            districtLabel={(id) => districtById(id)?.nom ?? id}
            onDistrict={(id) => {
              const item = districtById(id)
              if (!item) return
              void navigate({
                to: "/atlas",
                search: {
                  district: item.id,
                  ville: item.autonome ? item.villes[0].id : undefined,
                },
              })
              reveal()
            }}
            onCity={(item) => {
              void navigate({ to: "/atlas", search: { ville: item.id } })
              reveal()
            }}
            label="Carte des districts de Côte d'Ivoire"
          />
          <div className="flex flex-wrap gap-1.5 px-1 pt-2">
            {geo.districts.map((item) => (
              <Link
                key={item.id}
                to="/atlas"
                search={{
                  district: item.id,
                  ville: item.autonome ? item.villes[0].id : undefined,
                }}
                onClick={reveal}
                aria-current={item === district ? "true" : undefined}
                className="inline-flex min-h-8 items-center rounded-full border border-line px-2.5 text-[12px] font-medium aria-[current]:border-orange aria-[current]:bg-orange aria-[current]:text-orange-ink"
              >
                {item.nom}
              </Link>
            ))}
          </div>
          <p className="mt-2 px-1 text-[11px] text-muted">
            Plus un district est vert, plus vous avez ouvert de ses villes ·{" "}
            {
              geo.districts.filter(
                (item) => masteryClass(item.id, visited) === "m3"
              ).length
            }
            /{geo.districts.length} complets. Limites : geoBoundaries (Banque
            mondiale, CC BY 4.0).
          </p>
        </div>

        <div
          ref={panel}
          className="min-w-0 scroll-mt-20 overflow-hidden card"
          aria-live="polite"
        >
          <div className="border-b border-line p-4">
            <nav
              className="flex flex-wrap items-center gap-1 text-xs text-muted"
              aria-label="Position"
            >
              <span>Côte d'Ivoire</span>
              <span aria-hidden>›</span>
              {ville && !district.autonome ? (
                <Link
                  to="/atlas"
                  search={{ district: district.id }}
                  className="font-medium text-green"
                >
                  {district.nom}
                </Link>
              ) : (
                <span>{district.nom}</span>
              )}
              {ville?.region && (
                <>
                  <span aria-hidden>›</span>
                  <span>{ville.region.nom}</span>
                </>
              )}
            </nav>
            {ville ? (
              <>
                <p className="mt-2 eyebrow text-orange">{villeKind(ville)}</p>
                <h2 className="font-display text-[28px] leading-tight font-bold tracking-tight">
                  {ville.nom}
                </h2>
                <div className="mt-2 flex flex-wrap gap-1.5">
                  <Pill>{plural(ville.localites.length, "localité")}</Pill>
                  <Pill>{plural(ville.quartiers.length, "quartier")}</Pill>
                  <Pill>{coordinates(ville)}</Pill>
                  {devMode && !ville.quartiersComplets && (
                    <Pill tone="warn">quartiers à compléter</Pill>
                  )}
                  {devMode && (
                    <button
                      type="button"
                      onClick={() =>
                        void copyText(ville.id, `${ville.id} copié`)
                      }
                      className="inline-flex h-6 items-center gap-1 rounded-md bg-land px-2 font-mono text-[11px]"
                    >
                      {ville.id}
                      <Copy className="size-3" aria-hidden />
                    </button>
                  )}
                </div>
              </>
            ) : (
              <>
                <p className="mt-2 eyebrow text-orange">District</p>
                <h2 className="font-display text-[28px] leading-tight font-bold tracking-tight">
                  {district.nom}
                </h2>
              </>
            )}
          </div>

          <div className="flex flex-col gap-5 p-4">
            {!ville &&
              district.regions.map((region) => (
                <div key={region.id}>
                  <SectionLabel>{`Région ${region.nom}`}</SectionLabel>
                  {region.villes.map((item) => (
                    <CityRow key={item.id} ville={item} />
                  ))}
                </div>
              ))}

            {ville && ville.aPlusieursLocalites && (
              <div>
                <SectionLabel>Communes</SectionLabel>
                <div className="flex flex-wrap gap-1.5">
                  <Link
                    to="/atlas"
                    search={{ ville: ville.id }}
                    aria-current={!localite ? "true" : undefined}
                    className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line px-3 text-[13px] font-medium aria-[current]:border-green aria-[current]:bg-green aria-[current]:text-surface"
                  >
                    Toutes
                    <small className="font-mono opacity-70">
                      {ville.quartiers.length}
                    </small>
                  </Link>
                  {ville.localites.map((item) => (
                    <Link
                      key={item.id}
                      to="/atlas"
                      search={{ ville: ville.id, localite: item.id }}
                      aria-current={item === localite ? "true" : undefined}
                      className="inline-flex min-h-9 items-center gap-1 rounded-full border border-line px-3 text-[13px] font-medium aria-[current]:border-green aria-[current]:bg-green aria-[current]:text-surface"
                    >
                      {item.nom}
                      {item.type === "sous-prefecture" && " (s.-p.)"}
                      <small className="font-mono opacity-70">
                        {item.quartiers.length}
                      </small>
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {ville && (
              <div>
                <SectionLabel>
                  {localite ? `Quartiers · ${localite.nom}` : "Quartiers"}
                </SectionLabel>
                {shownQuartiers.length ? (
                  <>
                    <div className="flex flex-wrap gap-1.5">
                      {visibleQuartiers.map((quartier) =>
                        devMode ? (
                          <button
                            key={quartier.id}
                            type="button"
                            onClick={() =>
                              void copyText(quartier.id, `${quartier.id} copié`)
                            }
                            className="flex min-w-0 flex-col rounded-xl bg-green-soft px-2.5 py-1.5 text-left"
                          >
                            <span className="font-medium">
                              {localite ? quartier.nom : quartier.libelle}
                            </span>
                            <code className="font-mono text-[10px] [overflow-wrap:anywhere] text-muted">
                              {quartier.id}
                            </code>
                          </button>
                        ) : (
                          <span
                            key={quartier.id}
                            className="rounded-xl bg-green-soft px-2.5 py-1.5 font-medium"
                          >
                            {localite ? quartier.nom : quartier.libelle}
                          </span>
                        )
                      )}
                    </div>
                    {shownQuartiers.length > visibleQuartiers.length && (
                      <Button
                        variant="ghost"
                        className="mt-2"
                        onClick={() => setExpandedFor(listKey)}
                      >
                        Afficher les {shownQuartiers.length} quartiers
                      </Button>
                    )}
                  </>
                ) : (
                  <Empty>Aucun quartier répertorié pour l'instant.</Empty>
                )}
              </div>
            )}

            {ville && (
              <div>
                <SectionLabel>
                  Villes les plus proches, à vol d'oiseau
                </SectionLabel>
                {nearest(ville).map(({ ville: item, km }) => (
                  <CityRow key={item.id} ville={item} meta={fmtKm(km)} />
                ))}
              </div>
            )}

            {ville?.region && (
              <div>
                <SectionLabel>{`Autres villes · ${ville.region.nom}`}</SectionLabel>
                {ville.region.villes.filter((item) => item !== ville).length ? (
                  ville.region.villes
                    .filter((item) => item !== ville)
                    .map((item) => <CityRow key={item.id} ville={item} />)
                ) : (
                  <Empty>Seule ville de la région dans le référentiel.</Empty>
                )}
              </div>
            )}

            {ville && (
              <div className="flex flex-wrap gap-2">
                <Link
                  to="/carte"
                  search={{ ville: ville.id }}
                  className="inline-flex min-h-11 items-center rounded-full bg-land px-5 text-sm font-semibold"
                >
                  Voir sur la carte
                </Link>
                {devMode && (
                  <Button
                    variant="outline"
                    onClick={() =>
                      void copyText(
                        JSON.stringify(
                          {
                            ville: {
                              id: ville.id,
                              nom: ville.nom,
                              lat: ville.lat,
                              lon: ville.lon,
                              regionId: ville.region?.id ?? null,
                              districtId: ville.district.id,
                            },
                            localites: ville.localites.map((item) => ({
                              id: item.id,
                              nom: item.nom,
                              type: item.type,
                              quartiers: item.quartiers.map((q) => ({
                                id: q.id,
                                nom: q.nom,
                              })),
                            })),
                          },
                          null,
                          2
                        ),
                        "JSON de la ville copié"
                      )
                    }
                  >
                    Copier le JSON
                  </Button>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
