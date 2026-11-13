import { Users } from "lucide-react"

import { CountryMap } from "@/components/country-map"
import { groupeById, peuplesDe } from "@/culture/peuples"
import { STORIES, villesOf } from "@/culture/stories"
import { WikiPhoto } from "@/culture/wiki-photo"
import {
  BackLink,
  Paragraphs,
  SectionTitle,
  Sources,
  StoryCard,
  StoryNotFound,
} from "@/features/decouvrir/components"

export function GroupePage({ id }: { id: string }) {
  const groupe = groupeById(id)
  if (!groupe) return <StoryNotFound />
  const peuples = peuplesDe(groupe.id)
  const villes = [...new Set(villesOf(peuples.flatMap((p) => p.villes)))]
  const stories = peuples.map((peuple) =>
    STORIES.find((story) => story.key === `peuple:${peuple.id}`)!
  )

  return (
    <article className="mx-auto flex max-w-2xl flex-col gap-4">
      <BackLink to="/decouvrir">Découvrir</BackLink>
      <div className="grid items-center gap-4 sm:grid-cols-[minmax(0,1fr)_200px]">
        <header className="flex flex-col gap-1">
          <p className="eyebrow text-green">Grand groupe</p>
          <h1 className="font-display text-[28px] leading-tight font-bold tracking-tight">
            {groupe.nom}
          </h1>
          <p className="text-muted">{groupe.aire}</p>
        </header>
        <CountryMap
          muted
          labels={false}
          cityClass={(ville) => (villes.includes(ville) ? "on" : "")}
          className="mx-auto max-w-[200px] [&_.gratl]:hidden"
          label={`Villes des peuples ${groupe.nom}`}
        />
      </div>
      <WikiPhoto
        title={groupe.wiki}
        alt={`Groupe ${groupe.nom}`}
        icon={Users}
        credit="full"
        className="aspect-[16/9] rounded-3xl"
      />
      <section className="flex flex-col gap-2">
        <SectionTitle title="Origines" />
        <Paragraphs items={groupe.origine} />
      </section>
      <Sources wiki={groupe.wiki} />
      <section className="flex flex-col gap-2.5">
        <SectionTitle title="Les peuples" />
        <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
          {stories.map((story) => (
            <StoryCard key={story.key} story={story} />
          ))}
        </div>
      </section>
    </article>
  )
}
