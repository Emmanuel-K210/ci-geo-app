import { distanceKm, geo, villes, type Ville } from "@/geo"
import { pick, type Rng } from "@/lib/random"

/** Well-known cities to measure from, spread over the country. */
export const CLOSER_REFERENCES = [
  "ci-v-abidjan",
  "ci-v-yamoussoukro",
  "ci-v-bouake",
  "ci-v-korhogo",
  "ci-v-san-pedro",
  "ci-v-man",
].map((id) => geo.ville(id)!)

/** Below this gap the answer would be a coin flip on rounded coordinates. */
export const MIN_GAP_KM = 15

export function nextChallenger(
  reference: Ville,
  current: Ville,
  rng: Rng = Math.random
): Ville {
  const base = distanceKm(reference, current)
  const candidates = villes.filter(
    (ville) =>
      ville !== reference &&
      ville !== current &&
      Math.abs(distanceKm(reference, ville) - base) >= MIN_GAP_KM
  )
  return pick(candidates, rng)
}

export type CloserChoice = "closer" | "farther"

export function isRight(
  reference: Ville,
  current: Ville,
  challenger: Ville,
  choice: CloserChoice
) {
  const farther =
    distanceKm(reference, challenger) > distanceKm(reference, current)
  return choice === (farther ? "farther" : "closer")
}
