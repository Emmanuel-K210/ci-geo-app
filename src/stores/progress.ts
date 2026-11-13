import { create } from "zustand"
import { createJSONStorage, persist } from "zustand/middleware"

import { dailyPoints, dayKey } from "@/features/games/daily"
import type { QuizMode } from "@/features/games/questions"
import { BADGES, type Badge, type BadgeState } from "@/stores/badges"
import type { GameEvent, GameId } from "@/stores/events"
import { levelOf } from "@/stores/levels"

export type Settings = {
  sound: boolean
  vibration: boolean
  /** Shows the ids and the JSON export in the atlas. */
  devMode: boolean
}

/** The last game played, so the home page can offer to resume it. */
export type LastGame = { game: GameId; mode?: QuizMode; at: string }

export type ProgressData = BadgeState & {
  xp: number
  last: LastGame | null
  /** The welcome screens were seen or skipped. */
  onboarded: boolean
  /** Best score per game, and per quiz category (« quiz:abidjan »). */
  best: Record<string, number>
  /** Unlock date (ISO) per badge id. */
  badges: Record<string, string>
  settings: Settings
}

export type Outcome = {
  xp: number
  /** Total XP before this game, to animate the gain. */
  xpBefore: number
  newBadges: Badge[]
  levelUp: ReturnType<typeof levelOf> | null
  record: boolean
}

type ProgressStore = ProgressData & {
  record: (event: GameEvent) => Outcome
  visit: (villeId: string) => Badge[]
  markRead: (storyId: string) => Badge[]
  setSetting: <K extends keyof Settings>(key: K, value: Settings[K]) => void
  finishOnboarding: () => void
  reset: () => void
}

const initial: ProgressData = {
  xp: 0,
  last: null,
  onboarded: false,
  played: {},
  xpByDay: {},
  best: {},
  daily: {},
  badges: {},
  visited: [],
  read: [],
  settings: { sound: true, vibration: true, devMode: false },
}

/** What is saved: the data without the actions. */
export const progressData = (state: ProgressData): ProgressData => ({
  xp: state.xp,
  last: state.last,
  onboarded: state.onboarded,
  xpByDay: state.xpByDay,
  played: state.played,
  best: state.best,
  daily: state.daily,
  badges: state.badges,
  visited: state.visited,
  read: state.read,
  settings: state.settings,
})

/** Adds today's XP and keeps only the last 60 days. */
function addDayXp(xpByDay: Record<string, number>, xp: number) {
  const today = dayKey()
  const next = { ...xpByDay, [today]: (xpByDay[today] ?? 0) + xp }
  return Object.fromEntries(
    Object.entries(next)
      .sort(([a], [b]) => b.localeCompare(a))
      .slice(0, 60)
  )
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
    case "sites":
      return [
        "sites",
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
    case "sites":
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
          xpByDay: addDayXp(before.xpByDay, xp),
          last: {
            game: event.game,
            mode: event.game === "quiz" ? event.mode : undefined,
            at: new Date().toISOString(),
          },
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
          xpBefore: before.xp,
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
      markRead: (storyId) => {
        const before = get()
        if (before.read.includes(storyId)) return []
        const next = { ...before, read: [...before.read, storyId] }
        const { badges, newBadges } = unlock(next, null)
        set({ read: next.read, badges })
        return newBadges
      },
      setSetting: (key, value) =>
        set({ settings: { ...get().settings, [key]: value } }),
      finishOnboarding: () => set({ onboarded: true }),
      reset: () =>
        set({ ...initial, onboarded: true, settings: get().settings }),
    }),
    {
      name: "ci-geo-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
      // New settings get their default for players who saved older ones.
      merge: (persisted, current) => {
        const saved = (persisted ?? {}) as Partial<ProgressData>
        return {
          ...current,
          ...saved,
          settings: { ...current.settings, ...saved.settings },
        }
      },
      partialize: (state): ProgressData => progressData(state),
    }
  )
)
