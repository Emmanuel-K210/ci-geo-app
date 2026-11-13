import { useNavigate } from "@tanstack/react-router"
import { Search, X } from "lucide-react"
import { useEffect, useMemo, useRef, useState } from "react"

import { localites, quartiers, villes } from "@/geo"
import { normalize } from "@/lib/format"
import { useUi } from "@/stores/ui"

type Entry = {
  key: string
  text: string
  sub: string
  ville: string
  localite?: string
}

const INDEX: Entry[] = [
  ...villes.map((ville) => ({
    text: ville.nom,
    sub: ville.region
      ? `Ville · ${ville.region.nom}`
      : "Ville · district autonome",
    ville: ville.id,
  })),
  ...localites
    .filter((localite) => localite.ville.aPlusieursLocalites)
    .map((localite) => ({
      text: localite.nom,
      sub: `Commune · ${localite.ville.nom}`,
      ville: localite.ville.id,
      localite: localite.id,
    })),
  ...quartiers.map((quartier) => ({
    text: quartier.nom,
    sub: `Quartier · ${quartier.libelle === quartier.nom ? "" : `${quartier.localite.nom}, `}${quartier.ville.nom}`,
    ville: quartier.ville.id,
    localite: quartier.ville.aPlusieursLocalites
      ? quartier.localite.id
      : undefined,
  })),
].map((entry) => ({ ...entry, key: normalize(entry.text) }))

export function SearchSheet() {
  const open = useUi((state) => state.searchOpen)
  const setOpen = useUi((state) => state.setSearchOpen)
  const [query, setQuery] = useState("")
  const input = useRef<HTMLInputElement>(null)
  const navigate = useNavigate()

  useEffect(() => {
    if (!open) return
    input.current?.focus()
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") setOpen(false)
    }
    document.addEventListener("keydown", onKey)
    document.body.style.overflow = "hidden"
    return () => {
      document.removeEventListener("keydown", onKey)
      document.body.style.overflow = ""
    }
  }, [open, setOpen])

  const results = useMemo(() => {
    const key = normalize(query)
    if (!key) return []
    const starts = INDEX.filter((entry) => entry.key.startsWith(key))
    const contains = INDEX.filter(
      (entry) => !entry.key.startsWith(key) && entry.key.includes(key)
    )
    return [...starts, ...contains].slice(0, 30)
  }, [query])

  if (!open) return null

  function choose(entry: Entry) {
    setOpen(false)
    setQuery("")
    void navigate({
      to: "/",
      search: { ville: entry.ville, localite: entry.localite },
    })
  }

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col bg-paper lg:bg-ink/30 lg:p-16"
      role="dialog"
      aria-modal="true"
      aria-label="Rechercher un lieu"
      onClick={(event) => {
        if (event.target === event.currentTarget) setOpen(false)
      }}
    >
      <div className="flex min-h-0 flex-1 flex-col bg-paper lg:mx-auto lg:w-full lg:max-w-xl lg:flex-none lg:rounded-2xl lg:shadow-xl">
        <div className="flex items-center gap-2 border-b border-line p-3 pt-[max(12px,env(safe-area-inset-top))]">
          <div className="relative flex-1">
            <Search
              className="absolute top-1/2 left-3.5 size-4 -translate-y-1/2 text-muted"
              aria-hidden
            />
            <input
              ref={input}
              type="search"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Une ville, une commune, un quartier…"
              aria-label="Rechercher un lieu"
              className="h-11 w-full rounded-full border border-line bg-surface pr-4 pl-10 text-[16px] outline-none focus:border-orange"
            />
          </div>
          <button
            type="button"
            onClick={() => setOpen(false)}
            aria-label="Fermer la recherche"
            className="grid size-11 place-items-center rounded-full bg-land"
          >
            <X className="size-5" aria-hidden />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto p-2 lg:max-h-[60vh]">
          {query && results.length === 0 && (
            <p className="p-4 text-sm text-muted">Aucun lieu trouvé.</p>
          )}
          {!query && (
            <p className="p-4 text-sm text-muted">
              {villes.length} villes, {localites.length} localités et{" "}
              {quartiers.length} quartiers. Les accents sont facultatifs.
            </p>
          )}
          {results.map((entry) => (
            <button
              key={`${entry.sub}-${entry.text}`}
              type="button"
              onClick={() => choose(entry)}
              className="flex min-h-12 w-full items-center justify-between gap-3 rounded-xl px-3 text-left hover:bg-land focus-visible:bg-land"
            >
              <span className="font-medium">{entry.text}</span>
              <span className="text-right text-xs text-muted">{entry.sub}</span>
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
