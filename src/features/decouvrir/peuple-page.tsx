import { Link } from "@tanstack/react-router"
import { Users } from "lucide-react"

import { CountryMap } from "@/components/country-map"
import { Pill } from "@/components/ui"
import { groupeById, peupleById, peuplesDe } from "@/culture/peuples"
import { STORIES, villesOf } from "@/culture/stories"
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

export function PeuplePage({ id }: { id: string }) {
  const peuple = peupleById(id)
  useMarkRead(peuple && `peuple:${peuple.id}`)
  if (!peuple) return <StoryNotFound />

  const groupe = groupeById(peuple.groupeId)
  const villes = villesOf(peuple.villes)
  const cousins = peuplesDe(peuple.groupeId)
    .filter((other) => other !== peuple)
    .slice(0, 4)
    .map((other) =>
      STORIES.find((story) => story.key === `peuple:${other.id}`)!
    )

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-4">
      <BackLink to="/decouvrir">Découvrir</BackLink>
      <WikiPhoto
        title={peuple.wiki}
        alt={`Le peuple ${peuple.nom}`}
        icon={Users}
        credit="full"
        className="-mx-4 aspect-[16/10] sm:mx-0 sm:rounded-3xl"
      />
      <header className="flex flex-col gap-2">
        {groupe && (
          <Link
            to="/decouvrir/groupes/$id"
            params={{ id: groupe.id }}
            className="self-start"
          >
            <Pill tone="green">Groupe {groupe.nom}</Pill>
          </Link>
        )}
        <h1 className="font-display text-[28px] leading-tight font-bold tracking-tight">
          Les {peuple.nom}
        </h1>
        <p className="text-[17px] leading-snug text-muted">{peuple.resume}</p>
      </header>

      <section className="flex flex-col gap-2">
        <SectionTitle title="Leur histoire" />
        <Paragraphs items={peuple.histoire} />
      </section>

      <Facts title="Culture et traditions" items={peuple.culture} />

      {villes.length > 0 && (
        <section className="grid items-center gap-3 card p-3 sm:grid-cols-[180px_minmax(0,1fr)]">
          <CountryMap
            muted
            labelled={villes}
            cityClass={(ville) => (villes.includes(ville) ? "on" : "")}
            className="mx-auto max-w-[220px] [&_.gratl]:hidden"
            label={`Villes du pays ${peuple.nom}`}
          />
          <div className="flex flex-col gap-2 px-1 pb-1">
            <p className="eyebrow">Où ils vivent</p>
            <div className="flex flex-wrap gap-1.5">
              {villes.map((ville) => (
                <Link
                  key={ville.id}
                  to="/atlas"
                  search={{ ville: ville.id }}
                  className="inline-flex min-h-9 items-center rounded-full border border-line px-3 text-[13px] font-medium hover:border-green"
                >
                  {ville.nom}
                </Link>
              ))}
            </div>
            <p className="text-xs text-muted">
              Les principales villes de leur région : beaucoup vivent aussi à
              Abidjan et dans tout le pays.
            </p>
          </div>
        </section>
      )}

      <Sources wiki={peuple.wiki} />

      {cousins.length > 0 && groupe && (
        <section className="flex flex-col gap-2.5">
          <SectionTitle title={`Autres peuples ${groupe.nom}`} />
          <div className="grid grid-cols-2 gap-2.5">
            {cousins.map((story) => (
              <StoryCard key={story.key} story={story} />
            ))}
          </div>
        </section>
      )}
    </article>
  )
}
