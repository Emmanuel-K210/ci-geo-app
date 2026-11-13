import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { dailyPoints } from "@/features/games/daily"
import { BADGES, type Badge, type BadgeState } from "@/stores/badges"
import type { GameEvent, GameId } from "@/stores/events"
import { levelOf } from "@/stores/levels"

export type Settings = { sound: boolean; vibration: boolean }

type ProgressData = BadgeState & {
  xp: number
  /** Best score per game, and per quiz category (« quiz:abidjan »). */
  best: Record<string, number>
  /** Unlock date (ISO) per badge id. */
  badges: Record<string, string>
  settings: Settings
}

export type Outcome = {
  xp: number
  newBadges: Badge[]
  levelUp: ReturnType<typeof levelOf> | null
  record: boolean
}

type ProgressStore = ProgressData & {
  record: (event: GameEvent) => Outcome
  visit: (villeId: string) => Badge[]
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  reset: () => void
}

const initial: ProgressData = {
  xp: 0,
  played: {},
  best: {},
  daily: {},
  badges: {},
  visited: [],
  settings: { sound: true, vibration: true },
}

/** The best-score key and the score itself: higher is always better. */
function scoreOf(event: GameEvent): [key: string, score: number] {
  switch (event.game) {
    case "quiz":
      return [`quiz:${event.mode}`, event.score]
    case "daily":
      return [
        "daily",
        event.distances.reduce((sum, km) => sum + dailyPoints(km), 0),
      ]
    case "clues":
      return ["clues", event.points]
    case "closer":
      return ["closer", event.streak]
    default:
      return [event.game, event.score]
  }
}

export function xpFor(event: GameEvent): number {
  const [, score] = scoreOf(event)
  switch (event.game) {
    case "daily":
      return Math.round(score / 5)
    case "clues":
      return score * 4
    default:
      return score * 10
  }
}

function unlock(data: ProgressData, event: GameEvent | null) {
  const now = new Date().toISOString()
  const newBadges = BADGES.filter(
    (badge) => !data.badges[badge.id] && badge.earned(event, data)
  )
  const badges = { ...data.badges }
  for (const badge of newBadges) badges[badge.id] = now
  return { badges, newBadges }
}

export const useProgress = create<ProgressStore>()(
  persist(
    (set, get) => ({
      ...initial,
      record: (event) => {
        const before = get()
        const [key, score] = scoreOf(event)
        const xp = xpFor(event)
        const next: ProgressData = {
          ...before,
          xp: before.xp + xp,
          played: {
            ...before.played,
            [event.game]: (before.played[event.game as GameId] ?? 0) + 1,
          },
          best: {
            ...before.best,
            [key]: Math.max(before.best[key] ?? 0, score),
          },
          daily:
            event.game === "daily"
              ? { ...before.daily, [event.day]: event.distances }
              : before.daily,
        }
        const { badges, newBadges } = unlock(next, event)
        set({ ...next, badges })
        const levelBefore = levelOf(before.xp)
        const levelAfter = levelOf(next.xp)
        return {
          xp,
          newBadges,
          levelUp: levelAfter.number > levelBefore.number ? levelAfter : null,
          // The first game sets the mark: only beating it is a record.
          record: before.best[key] !== undefined && score > before.best[key],
        }
      },
      visit: (villeId) => {
        const before = get()
        if (before.visited.includes(villeId)) return []
        const next = { ...before, visited: [...before.visited, villeId] }
        const { badges, newBadges } = unlock(next, null)
        set({ visited: next.visited, badges })
        return newBadges
      },
      setSetting: (key, value) =>
        set({ settings: { ...get().settings, [key]: value } }),
      reset: () => set({ ...initial, settings: get().settings }),
    }),
    {
      name: "ci-geo-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      partialize: (state): ProgressData => ({
        xp: state.xp,
        played: state.played,
        best: state.best,
        daily: state.daily,
        badges: state.badges,
        visited: state.visited,
        settings: state.settings,
      }),
    }
  )
)
