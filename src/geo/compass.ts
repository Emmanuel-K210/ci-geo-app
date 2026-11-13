const rad = (degrees: number) => (degrees * Math.PI) / 180
const deg = (radians: number) => (radians * 180) / Math.PI

type Point = { lat: number; lon: number }

/** Initial bearing from a to b, in degrees clockwise from the north. */
export function bearing(a: Point, b: Point): number {
  const y = Math.sin(rad(b.lon - a.lon)) * Math.cos(rad(b.lat))
  const x =
    Math.cos(rad(a.lat)) * Math.sin(rad(b.lat)) -
    Math.sin(rad(a.lat)) * Math.cos(rad(b.lat)) * Math.cos(rad(b.lon - a.lon))
  return (deg(Math.atan2(y, x)) + 360) % 360
}

export const DIRECTIONS = ["N", "NE", "E", "SE", "S", "SO", "O", "NO"] as const
export type Direction = (typeof DIRECTIONS)[number]

export const directionNames: Record<Direction, string> = {
  N: "nord",
  NE: "nord-est",
  E: "est",
  SE: "sud-est",
  S: "sud",
  SO: "sud-ouest",
  O: "ouest",
  NO: "nord-ouest",
}

export function direction(degrees: number): Direction {
  return DIRECTIONS[Math.round(degrees / 45) % 8]
}

/** How far the bearing is from the edge of its sector: small means ambiguous. */
export function sectorMargin(degrees: number): number {
  const offset = (((degrees % 45) + 45) % 45) - 22.5
  return Math.abs(offset)
}

/** « au nord-est », « à l'est », « à l'ouest ». */
export function towards(dir: Direction): string {
  const name = directionNames[dir]
  return /^[aeiou]/.test(name) ? `à l'${name}` : `au ${name}`
}

export const ARROWS: Record<Direction, string> = {
  N: "↑",
  NE: "↗",
  E: "→",
  SE: "↘",
  S: "↓",
  SO: "↙",
  O: "←",
  NO: "↖",
}
