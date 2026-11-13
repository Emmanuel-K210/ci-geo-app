import { distanceKm, villes, type Ville } from "@/geo"
import { bearing, direction, sectorMargin, type Direction } from "@/geo/compass"
import { pick, type Rng } from "@/lib/random"

export const COMPASS_ROUND = 10

export type CompassQuestion = {
  from: Ville
  to: Ville
  degrees: number
  answer: Direction
}

/** Far enough apart, and not on the edge between two directions. */
export function compassQuestion(
  previous: CompassQuestion[] = [],
  rng: Rng = Math.random
): CompassQuestion {
  for (;;) {
    const from = pick(villes, rng)
    const to = pick(villes, rng)
    if (from === to || distanceKm(from, to) < 100) continue
    if (previous.some((q) => q.from === from && q.to === to)) continue
    const degrees = bearing(from, to)
    if (sectorMargin(degrees) < 7) continue
    return { from, to, degrees, answer: direction(degrees) }
  }
}
