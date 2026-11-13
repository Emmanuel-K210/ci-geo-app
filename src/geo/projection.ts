// Equirectangular projection corrected for the latitude of the country: enough
// to place cities on a small map, not for measuring.
export const BOUNDS = { west: -8.75, east: -2.35, south: 4.15, north: 10.85 }
const KX = Math.cos((7.5 * Math.PI) / 180)
export const MAP_W = 560
export const MAP_H = Math.round(
  (MAP_W * (BOUNDS.north - BOUNDS.south)) / ((BOUNDS.east - BOUNDS.west) * KX)
)

export const px = (lon: number) =>
  ((lon - BOUNDS.west) / (BOUNDS.east - BOUNDS.west)) * MAP_W
export const py = (lat: number) =>
  ((BOUNDS.north - lat) / (BOUNDS.north - BOUNDS.south)) * MAP_H

export function unproject(x: number, y: number) {
  return {
    lon: BOUNDS.west + (x / MAP_W) * (BOUNDS.east - BOUNDS.west),
    lat: BOUNDS.north - (y / MAP_H) * (BOUNDS.north - BOUNDS.south),
  }
}

export type LabelPosition = "left" | "right" | "above" | "below"

/** Where the label of a close neighbour goes, so names do not overlap. */
export const LABEL_POSITIONS: Record<string, LabelPosition> = {
  Dabou: "left",
  Bongouanou: "above",
  Daloa: "below",
  Dimbokro: "below",
  Toumodi: "left",
  Yamoussoukro: "left",
  Mankono: "above",
  Séguéla: "left",
  Bouaflé: "above",
  Agboville: "below",
  Daoukro: "above",
}
