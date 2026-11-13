import { useState } from "react"

import { PageTitle, Segmented } from "@/components/ui"
import { CATEGORIES, type SiteCategorie } from "@/culture/sites"
import { STORIES } from "@/culture/stories"
import { BackLink, StoryCard } from "@/features/decouvrir/components"

type Filter = SiteCategorie | "tout"

export function SitesPage() {
  const [filter, setFilter] = useState<Filter>("tout")
  const sites = STORIES.filter(
    (story) =>
      story.kind === "site" &&
      (filter === "tout" || story.item.categorie === filter)
  )
  return (
    <div className="flex flex-col gap-4">
      <BackLink to="/decouvrir">Découvrir</BackLink>
      <PageTitle eyebrow="Découvrir" title="Sites à visiter" />
      <div className="-mt-3">
        <Segmented<Filter>
          label="Catégorie"
          value={filter}
          onChange={setFilter}
          options={[
            { value: "tout", label: "Tous" },
            ...(Object.entries(CATEGORIES) as [SiteCategorie, string][]).map(
              ([value, label]) => ({ value, label })
            ),
          ]}
        />
      </div>
      <div className="grid grid-cols-2 gap-2.5 lg:grid-cols-3">
        {sites.map((story) => (
          <StoryCard key={story.key} story={story} />
        ))}
      </div>
    </div>
  )
}
