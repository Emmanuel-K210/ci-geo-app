import type { ReactNode } from "react"

import { PageTitle } from "@/components/ui"
import { geo, type Ville } from "@/geo"

function Node({
  kind,
  label,
  children,
}: {
  kind: string
  label: string
  children: ReactNode
}) {
  return (
    <details className="border-b border-line last:border-0 [&_details]:ml-4 [&_details]:border-0">
      <summary className="flex min-h-11 cursor-pointer items-center gap-2 font-medium">
        <span className="w-20 flex-none eyebrow text-[10px]">{kind}</span>
        {label}
      </summary>
      <div className="pb-2">{children}</div>
    </details>
  )
}

const Leaves = ({ names }: { names: string[] }) => (
  <p className="mb-2 ml-22 text-[13px] text-muted">
    {names.length ? names.join(" · ") : "aucun quartier"}
  </p>
)

function VilleNode({ ville }: { ville: Ville }) {
  return (
    <Node kind="Ville" label={ville.nom}>
      {ville.aPlusieursLocalites ? (
        ville.localites.map((localite) => (
          <Node
            key={localite.id}
            kind={localite.type === "commune" ? "Commune" : "Sous-préf."}
            label={localite.nom}
          >
            <Leaves names={localite.quartiers.map((q) => q.nom)} />
          </Node>
        ))
      ) : (
        <Leaves names={ville.quartiers.map((q) => q.nom)} />
      )}
    </Node>
  )
}

export function ListPage() {
  return (
    <div className="flex flex-col gap-4">
      <PageTitle eyebrow="Liste" title="Tout le référentiel" />
      <div className="card px-4 py-1">
        {geo.districts.map((district) => (
          <Node
            key={district.id}
            kind={district.autonome ? "Autonome" : "District"}
            label={district.nom}
          >
            {district.autonome
              ? district.villes.map((ville) => (
                  <VilleNode key={ville.id} ville={ville} />
                ))
              : district.regions.map((region) => (
                  <Node
                    key={region.id}
                    kind="Région"
                    label={`${region.nom} · ${region.chefLieu.nom}`}
                  >
                    {region.villes.map((ville) => (
                      <VilleNode key={ville.id} ville={ville} />
                    ))}
                  </Node>
                ))}
          </Node>
        ))}
      </div>
    </div>
  )
}
