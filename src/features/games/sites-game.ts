import { SITES, type Site } from "@/culture/sites"
import { sample, type Rng } from "@/lib/random"

export const SITES_ROUND = 5
export const SITES_MAX = SITES_ROUND * 100

/** Five different sites to place. */
export const sitesRound = (rng?: Rng): Site[] => sample(SITES, SITES_ROUND, rng)
