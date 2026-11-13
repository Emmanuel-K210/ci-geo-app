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

/** Simplified outline (lon, lat): not a boundary of record. */
export const OUTLINE: [number, number][] = [
  [-8.2, 10.1],
  [-7.9, 10.3],
  [-7.4, 10.45],
  [-6.95, 10.7],
  [-6.2, 10.5],
  [-5.5, 10.45],
  [-5.1, 10.3],
  [-4.7, 9.75],
  [-4.25, 9.65],
  [-3.65, 9.9],
  [-3.1, 9.75],
  [-2.7, 9.5],
  [-2.5, 8.2],
  [-2.9, 7.9],
  [-3.2, 6.8],
  [-3.1, 6.1],
  [-3.1, 5.4],
  [-2.85, 5.1],
  [-3.7, 5.15],
  [-4.6, 5.2],
  [-5.4, 5.1],
  [-6.2, 4.8],
  [-7, 4.5],
  [-7.55, 4.35],
  [-7.55, 5.1],
  [-7.9, 5.7],
  [-8.4, 6.3],
  [-8.6, 7.0],
  [-8.45, 7.6],
  [-8.45, 8.2],
  [-7.8, 8.5],
  [-7.95, 9.2],
  [-8.2, 9.65],
]

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
