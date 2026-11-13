import type { ProgressData } from "@/stores/progress"

const maxBy = (
  a: Partial<Record<string, number>>,
  b: Partial<Record<string, number>>
) => {
  const out: Record<string, number> = {}
  for (const key of new Set([...Object.keys(a), ...Object.keys(b)]))
    out[key] = Math.max(a[key] ?? 0, b[key] ?? 0)
  return out
}

/**
 * Two saves of the same player, from two devices, made one: nothing earned on
 * either side is lost. XP cannot be summed without counting games twice, so
 * the larger total wins.
 */
export function mergeProgress(
  local: ProgressData,
  remote: Partial<ProgressData>
): ProgressData {
  const badges = { ...remote.badges }
  for (const [id, at] of Object.entries(local.badges))
    if (!badges[id] || at < badges[id]) badges[id] = at

  const last =
    !remote.last || (local.last && local.last.at >= remote.last.at)
      ? local.last
      : remote.last

  return {
    xp: Math.max(local.xp, remote.xp ?? 0),
    last,
    onboarded: local.onboarded || !!remote.onboarded,
    played: maxBy(local.played, remote.played ?? {}),
    best: maxBy(local.best, remote.best ?? {}),
    xpByDay: maxBy(local.xpByDay, remote.xpByDay ?? {}),
    daily: { ...remote.daily, ...local.daily },
    badges,
    visited: [...new Set([...(remote.visited ?? []), ...local.visited])],
    read: [...new Set([...(remote.read ?? []), ...local.read])],
    // Settings belong to the device.
    settings: local.settings,
  }
}
