import { villes, type Ville } from "@/geo"
import { fmtKm } from "@/lib/format"
import { hashSeed, sample, seededRng } from "@/lib/random"

export const DAILY_COUNT = 5
export const DAILY_MAX = DAILY_COUNT * 100

/** The day in Abidjan, which lives on UTC all year. */
export const dayKey = (date = new Date()) => date.toISOString().slice(0, 10)

export const formatDay = (key: string) => key.split("-").reverse().join("/")

/** Everyone gets the same cities on the same day. */
export function dailyVilles(key: string): Ville[] {
  return sample(villes, DAILY_COUNT, seededRng(hashSeed(`ci-geo:${key}`)))
}

/** 100 points within 10 km, then down to 0 at 300 km. */
export function dailyPoints(km: number): number {
  if (km <= 10) return 100
  return Math.max(0, Math.round(100 * (1 - (km - 10) / 290)))
}

export type Square = "🟩" | "🟨" | "🟧" | "🟥"

export function square(km: number): Square {
  if (km < 25) return "🟩"
  if (km < 75) return "🟨"
  if (km < 150) return "🟧"
  return "🟥"
}

export function shareText(key: string, distances: number[], url?: string) {
  const total = distances.reduce((sum, km) => sum + dailyPoints(km), 0)
  const average = distances.reduce((sum, km) => sum + km, 0) / distances.length
  return [
    `CI-Geo · Défi du ${formatDay(key)}`,
    `${distances.map(square).join("")} ${total}/${DAILY_MAX}`,
    `En moyenne à ${fmtKm(average)} des villes`,
    url,
  ]
    .filter(Boolean)
    .join("\n")
}

export function msUntilNextDay(now = new Date()) {
  const next = Date.UTC(
    now.getUTCFullYear(),
    now.getUTCMonth(),
    now.getUTCDate() + 1
  )
  return next - now.getTime()
}

/** Days in a row with a daily challenge played, ending today or yesterday. */
export function dailyStreak(keys: string[], today = dayKey()): number {
  const played = new Set(keys)
  const cursor = new Date(`${today}T00:00:00Z`)
  if (!played.has(today)) cursor.setUTCDate(cursor.getUTCDate() - 1)
  let streak = 0
  while (played.has(dayKey(cursor))) {
    streak++
    cursor.setUTCDate(cursor.getUTCDate() - 1)
  }
  return streak
}
