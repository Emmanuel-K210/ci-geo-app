export const LEVELS = [
  { min: 0, name: "Touriste" },
  { min: 200, name: "Voyageur" },
  { min: 600, name: "Guide" },
  { min: 1200, name: "Explorateur" },
  { min: 2500, name: "Géographe" },
  { min: 5000, name: "Griot de la géo" },
] as const

export function levelOf(xp: number) {
  let index = 0
  while (index + 1 < LEVELS.length && xp >= LEVELS[index + 1].min) index++
  const level = LEVELS[index]
  const next = LEVELS[index + 1]
  return {
    number: index + 1,
    name: level.name,
    min: level.min,
    next,
    /** Share of the way to the next level, 1 at the last one. */
    progress: next ? (xp - level.min) / (next.min - level.min) : 1,
  }
}
