import { useState } from "react"

import { PageTitle } from "@/components/ui"
import { localiteById, villeById, villes } from "@/geo"
import { plural } from "@/lib/format"

const selectClass =
  "h-12 w-full min-w-0 rounded-xl border border-line bg-surface px-3 text-[16px] text-ink disabled:opacity-60"

export function PickerPage() {
  const [villeId, setVilleId] = useState("ci-v-abidjan")
  const [localiteId, setLocaliteId] = useState("ci-l-abidjan-cocody")
  const [quartierId, setQuartierId] = useState("")

  const ville = villeById(villeId)
  const localite = localiteById(localiteId)
  const list = ville
    ? localite?.ville === ville
      ? localite.quartiers
      : ville.quartiers
    : []
  const quartier = list.find((q) => q.id === quartierId)

  return (
    <div className="flex flex-col gap-4">
      <PageTitle eyebrow="Sélecteur" title="Ville, puis quartier">
        Le choix de la ville recharge les quartiers ; à Abidjan, la commune
        affine la liste.
      </PageTitle>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className="flex flex-col gap-4 card p-4">
          <label className="flex flex-col gap-1.5 font-medium">
            Ville
            <select
              className={selectClass}
              value={villeId}
              onChange={(event) => {
                setVilleId(event.target.value)
                setLocaliteId("")
                setQuartierId("")
              }}
            >
              <option value="">Choisir une ville…</option>
              {villes.map((item) => (
                <option key={item.id} value={item.id}>
                  {item.nom}
                </option>
              ))}
            </select>
          </label>
          {ville?.aPlusieursLocalites && (
            <label className="flex flex-col gap-1.5 font-medium">
              Commune
              <select
                className={selectClass}
                value={localiteId}
                onChange={(event) => {
                  setLocaliteId(event.target.value)
                  setQuartierId("")
                }}
              >
                <option value="">Toutes les communes</option>
                {ville.localites.map((item) => (
                  <option key={item.id} value={item.id}>
                    {item.nom}
                  </option>
                ))}
              </select>
            </label>
          )}
          <label className="flex flex-col gap-1.5 font-medium">
            <span>
              Quartier{" "}
              <small className="font-normal text-muted">
                {ville
                  ? list.length
                    ? plural(list.length, "quartier")
                    : "saisie libre dans l'application"
                  : ""}
              </small>
            </span>
            <select
              className={selectClass}
              value={quartierId}
              disabled={!list.length}
              onChange={(event) => setQuartierId(event.target.value)}
            >
              <option value="">
                {!ville
                  ? "Choisir d'abord une ville"
                  : list.length
                    ? "Choisir un quartier…"
                    : "Aucun quartier connu"}
              </option>
              {list.map((item) => (
                <option key={item.id} value={item.id}>
                  {ville?.aPlusieursLocalites && !localite
                    ? item.libelle
                    : item.nom}
                </option>
              ))}
            </select>
          </label>
        </div>
        <div className="flex min-w-0 flex-col gap-2 card p-4">
          <p className="eyebrow">Valeur enregistrée</p>
          <pre className="overflow-x-auto rounded-xl bg-paper p-3.5 font-mono text-xs leading-relaxed">
            {JSON.stringify(
              {
                villeId: ville?.id ?? null,
                ville: ville?.nom ?? null,
                localiteId:
                  quartier?.localite.id ??
                  (localite?.ville === ville ? localite?.id : null) ??
                  null,
                quartierId: quartier?.id ?? null,
                quartier: quartier?.nom ?? null,
              },
              null,
              2
            )}
          </pre>
        </div>
      </div>
    </div>
  )
}
