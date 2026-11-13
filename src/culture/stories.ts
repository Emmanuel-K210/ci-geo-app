import { PEUPLES, type Peuple } from "@/culture/peuples"
import { SITES, type Site } from "@/culture/sites"
import { villeById } from "@/geo"
import { hashSeed, pick, seededRng } from "@/lib/random"

/** A people or a site, as a story to read. */
export type Story =
  | { kind: "peuple"; key: string; item: Peuple }
  | { kind: "site"; key: string; item: Site }

export const STORIES: Story[] = [
  ...SITES.map((item) => ({
    kind: "site" as const,
    key: `site:${item.id}`,
    item,
  })),
  ...PEUPLES.map((item) => ({
    kind: "peuple" as const,
    key: `peuple:${item.id}`,
    item,
  })),
]

/** The same story for everyone on the same day. */
export const storyOfTheDay = (day: string): Story =>
  pick(STORIES, seededRng(hashSeed(`ci-geo:recit:${day}`)))

/** The cities of the reference, for ids written without « ci-v- ». */
export const villesOf = (ids: string[]) =>
  ids.flatMap((id) => {
    const ville = villeById(`ci-v-${id}`)
    return ville ? [ville] : []
  })
