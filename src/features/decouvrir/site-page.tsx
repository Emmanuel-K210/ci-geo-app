import { Link } from "@tanstack/react-router"
import { MapPin } from "lucide-react"

import { CountryMap, Marker } from "@/components/country-map"
import { Pill } from "@/components/ui"
import { CATEGORIES, SITES, siteById } from "@/culture/sites"
import { STORIES } from "@/culture/stories"
import { useMarkRead } from "@/culture/use-mark-read"
import { WikiPhoto } from "@/culture/wiki-photo"
import {
  BackLink,
  Facts,
  Paragraphs,
  SectionTitle,
  Sources,
  StoryCard,
  StoryNotFound,
} from "@/features/decouvrir/components"
import { CATEGORY_ICONS } from "@/features/decouvrir/story-meta"
import { distanceKm, villeById } from "@/geo"
import { px, py } from "@/geo/projection"
import { fmtKm } from "@/lib/format"

export function SitePage({ id }: { id: string }) {
  const site = siteById(id)
  useMarkRead(site && `site:${site.id}`)
  if (!site) return <StoryNotFound />

  const ville = villeById(`ci-v-${site.ville}`)
  const near = SITES.filter((other) => other !== site)
    .map((other) => ({ other, km: distanceKm(site, other) }))
    .sort((a, b) => a.km - b.km)
    .slice(0, 2)
    .map(({ other }) =>
      STORIES.find((story) => story.key === `site:${other.id}`)!
    )

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-4">
      <BackLink to="/decouvrir/sites">Sites</BackLink>
      <WikiPhoto
        title={site.wiki}
        alt={site.nom}
        icon={CATEGORY_ICONS[site.categorie]}
        credit="full"
        className="-mx-4 aspect-[16/10] sm:mx-0 sm:rounded-3xl"
      />
      <header className="flex flex-col gap-2">
        <div className="flex flex-wrap gap-1.5">
          <Pill tone="green">{CATEGORIES[site.categorie]}</Pill>
          {site.unesco && (
            <Pill tone="orange">Patrimoine mondial UNESCO · {site.unesco}</Pill>
          )}
        </div>
        <h1 className="font-display text-[28px] leading-tight font-bold tracking-tight text-balance">
          {site.nom}
        </h1>
        <p className="text-[17px] leading-snug text-muted">{site.resume}</p>
      </header>

      <section className="flex flex-col gap-2">
        <SectionTitle title="L'histoire" />
        <Paragraphs items={site.histoire} />
      </section>

      <Facts title="À savoir" items={site.aSavoir} />

      <section className="grid items-center gap-3 card p-3 sm:grid-cols-[180px_minmax(0,1fr)]">
        <CountryMap
          muted
          labels={false}
          className="mx-auto max-w-[220px] [&_.gratl]:hidden"
          label={`${site.nom} sur la carte`}
        >
          <Marker at={site} kind="target" />
          <text
            className="label"
            x={px(site.lon)}
            y={py(site.lat) - 14}
            textAnchor="middle"
          >
            {site.nom.split(" ")[0]}
          </text>
        </CountryMap>
        <div className="flex flex-col gap-2 px-1 pb-1">
          <p className="flex items-center gap-1.5 eyebrow">
            <MapPin className="size-3.5" aria-hidden />
            Où c'est
          </p>
          {ville && (
            <p className="text-sm">
              {distanceKm(site, ville) < 5
                ? ville.nom
                : `À ${fmtKm(distanceKm(site, ville))} de ${ville.nom}`}
              , district {ville.district.nom}.
            </p>
          )}
          {ville && (
            <Link
              to="/atlas"
              search={{ ville: ville.id }}
              className="text-sm font-medium text-green underline-offset-2 hover:underline"
            >
              Ouvrir {ville.nom} dans l'atlas
            </Link>
          )}
        </div>
      </section>

      <Sources wiki={site.wiki} />

      <section className="flex flex-col gap-2.5">
        <SectionTitle title="Pas loin" />
        <div className="grid grid-cols-2 gap-2.5">
          {near.map((story) => (
            <StoryCard key={story.key} story={story} />
          ))}
        </div>
      </section>
    </article>
  )
}
