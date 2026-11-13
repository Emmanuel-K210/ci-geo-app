import { describe, expect, it } from "vitest"

import { cluePoints, cluesFor, guessFeedback } from "@/features/games/clues"
import { isRight, MIN_GAP_KM, nextChallenger } from "@/features/games/closer"
import { compassQuestion } from "@/features/games/compass-game"
import {
  cityOfTheDay,
  dailyPoints,
  dailyStreak,
  dailyVilles,
  msUntilNextDay,
  recentDays,
  shareText,
  square,
} from "@/features/games/daily"
import { makeQuestion, QUIZ_MODES } from "@/features/games/questions"
import { ABIDJAN, distanceKm, geo, villes, YAMOUSSOUKRO } from "@/geo"
import { bearing, direction, sectorMargin } from "@/geo/compass"
import { BOUNDS, px, py, unproject } from "@/geo/projection"
import { seededRng } from "@/lib/random"
import { groupeById, PEUPLES } from "@/culture/peuples"
import { SITES } from "@/culture/sites"
import { STORIES, storyOfTheDay, villesOf } from "@/culture/stories"
import { BADGES } from "@/stores/badges"
import { mergeProgress } from "@/stores/merge-progress"
import { levelOf } from "@/stores/levels"
import { xpFor } from "@/stores/progress"

const bouake = geo.ville("ci-v-bouake")!
const korhogo = geo.ville("ci-v-korhogo")!
const sanPedro = geo.ville("ci-v-san-pedro")!

describe("geography", () => {
  it("measures and orients", () => {
    expect(Math.round(distanceKm(ABIDJAN, bouake))).toBe(286)
    expect(direction(bearing(ABIDJAN, korhogo))).toBe("N")
    expect(direction(bearing(ABIDJAN, sanPedro))).toBe("O")
    expect(sectorMargin(22.5)).toBe(0)
    expect(sectorMargin(45)).toBe(22.5)
  })

  it("projects both ways", () => {
    const back = unproject(px(ABIDJAN.lon), py(ABIDJAN.lat))
    expect(back.lat).toBeCloseTo(ABIDJAN.lat, 6)
    expect(back.lon).toBeCloseTo(ABIDJAN.lon, 6)
  })
})

describe("quiz", () => {
  it.each(QUIZ_MODES)(
    "makes four distinct answers with the good one (%s)",
    (mode) => {
      const rng = seededRng(7)
      for (let i = 0; i < 200; i++) {
        const question = makeQuestion(mode, [], rng)
        expect(new Set(question.options).size).toBe(4)
        expect(question.options).toContain(question.good)
      }
    }
  )
})

describe("daily challenge", () => {
  it("gives everyone the same five cities for a day", () => {
    expect(dailyVilles("2026-11-13")).toEqual(dailyVilles("2026-11-13"))
    expect(new Set(dailyVilles("2026-11-13")).size).toBe(5)
    expect(dailyVilles("2026-11-13")).not.toEqual(dailyVilles("2026-11-14"))
  })

  it("scores and colours a distance", () => {
    expect(dailyPoints(3)).toBe(100)
    expect(dailyPoints(300)).toBe(0)
    expect(dailyPoints(155)).toBe(50)
    expect([10, 50, 100, 400].map(square).join("")).toBe("🟩🟨🟧🟥")
  })

  it("shares squares and the total", () => {
    const text = shareText("2026-11-13", [5, 40, 90, 200, 5])
    expect(text).toContain("Défi du 13/11/2026")
    expect(text).toContain("🟩🟨🟧🟥🟩")
  })

  it("counts days in a row", () => {
    const days = ["2026-11-11", "2026-11-12", "2026-11-13", "2026-11-09"]
    expect(dailyStreak(days, "2026-11-13")).toBe(3)
    expect(dailyStreak(days, "2026-11-14")).toBe(3)
    expect(dailyStreak(days, "2026-11-15")).toBe(0)
  })

  it("resets at midnight UTC, Abidjan time", () => {
    expect(msUntilNextDay(new Date("2026-11-13T23:59:00Z"))).toBe(60_000)
  })
})

describe("mystery city", () => {
  it("gives five clues, the name last", () => {
    const clues = cluesFor(bouake)
    expect(clues).toHaveLength(5)
    expect(clues[0].text).toContain("de Yamoussoukro")
    expect(clues[4].text).toContain("« B »")
    expect(cluesFor(YAMOUSSOUKRO)[0].text).toContain("d'Abidjan")
    for (const ville of villes)
      for (const clue of cluesFor(ville).slice(0, 4))
        expect(clue.text).not.toContain(ville.nom)
  })

  it("points the way after a wrong guess", () => {
    expect(guessFeedback(ABIDJAN, korhogo).towards).toBe("N")
    expect(cluePoints(0)).toBe(5)
    expect(cluePoints(7)).toBe(0)
  })
})

describe("closer or farther", () => {
  it("never asks a coin flip", () => {
    const rng = seededRng(3)
    for (let i = 0; i < 200; i++) {
      const challenger = nextChallenger(ABIDJAN, bouake, rng)
      const gap = Math.abs(
        distanceKm(ABIDJAN, challenger) - distanceKm(ABIDJAN, bouake)
      )
      expect(gap).toBeGreaterThanOrEqual(MIN_GAP_KM)
    }
    expect(isRight(ABIDJAN, bouake, korhogo, "farther")).toBe(true)
    expect(isRight(ABIDJAN, korhogo, bouake, "farther")).toBe(false)
  })
})

describe("compass", () => {
  it("keeps away from the edge between two directions", () => {
    const rng = seededRng(11)
    for (let i = 0; i < 200; i++) {
      const question = compassQuestion([], rng)
      expect(sectorMargin(question.degrees)).toBeGreaterThanOrEqual(7)
      expect(distanceKm(question.from, question.to)).toBeGreaterThanOrEqual(100)
    }
  })
})

describe("progression", () => {
  it("climbs the levels", () => {
    expect(levelOf(0)).toMatchObject({ number: 1, name: "Touriste" })
    expect(levelOf(650)).toMatchObject({ number: 3, name: "Guide" })
    expect(levelOf(99_999).progress).toBe(1)
  })

  it("rewards each game", () => {
    expect(xpFor({ game: "quiz", mode: "tout", score: 7, total: 10 })).toBe(70)
    expect(
      xpFor({ game: "daily", day: "2026-11-13", distances: [0, 0, 0, 0, 0] })
    ).toBe(100)
    expect(xpFor({ game: "clues", points: 25, firstClue: 5 })).toBe(100)
  })

  it("has unique badges", () => {
    expect(new Set(BADGES.map((badge) => badge.id)).size).toBe(BADGES.length)
  })
})

describe("home", () => {
  it("lists the last days, oldest first", () => {
    expect(recentDays(3, "2026-03-01")).toEqual([
      "2026-02-27",
      "2026-02-28",
      "2026-03-01",
    ])
  })

  it("picks the same city of the day, outside the challenge", () => {
    const key = "2026-11-13"
    expect(cityOfTheDay(key)).toBe(cityOfTheDay(key))
    expect(dailyVilles(key)).not.toContain(cityOfTheDay(key))
  })
})

describe("cloud save", () => {
  const base = {
    xp: 0,
    last: null,
    onboarded: false,
    played: {},
    best: {},
    xpByDay: {},
    daily: {},
    badges: {},
    visited: [],
    read: [],
    settings: { sound: true, vibration: true, devMode: false },
  }

  it("keeps what was earned on both devices", () => {
    const merged = mergeProgress(
      {
        ...base,
        xp: 300,
        best: { quiz: 7 },
        badges: { a: "2026-11-10T00:00:00Z" },
        visited: ["x"],
        daily: { "2026-11-12": [10] },
      },
      {
        xp: 250,
        best: { quiz: 9, pin: 4 },
        badges: { a: "2026-11-01T00:00:00Z", b: "2026-11-02T00:00:00Z" },
        visited: ["y", "x"],
        daily: { "2026-11-11": [20] },
        settings: { sound: false, vibration: false, devMode: true },
      }
    )
    expect(merged.xp).toBe(300)
    expect(merged.best).toEqual({ quiz: 9, pin: 4 })
    expect(merged.badges).toEqual({
      a: "2026-11-01T00:00:00Z",
      b: "2026-11-02T00:00:00Z",
    })
    expect(merged.visited.sort()).toEqual(["x", "y"])
    expect(Object.keys(merged.daily).sort()).toEqual([
      "2026-11-11",
      "2026-11-12",
    ])
    expect(merged.settings.sound).toBe(true)
  })
})

describe("culture", () => {
  it("links peoples and sites to cities of the reference", () => {
    for (const peuple of PEUPLES) {
      expect(groupeById(peuple.groupeId), peuple.id).toBeDefined()
      expect(villesOf(peuple.villes)).toHaveLength(peuple.villes.length)
    }
    for (const site of SITES) {
      expect(villesOf([site.ville]), site.id).toHaveLength(1)
      expect(site.lat).toBeGreaterThan(BOUNDS.south)
      expect(site.lat).toBeLessThan(BOUNDS.north)
      expect(site.lon).toBeGreaterThan(BOUNDS.west)
      expect(site.lon).toBeLessThan(BOUNDS.east)
    }
  })

  it("keeps the names out of the clues", () => {
    const strip = (text: string) =>
      text.normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase()
    for (const peuple of PEUPLES) {
      const name = new RegExp(`\\b${strip(peuple.nom.split(" ")[0])}\\b`)
      for (const clue of peuple.indices)
        expect(strip(clue), clue).not.toMatch(name)
    }
    for (const site of SITES) expect(site.indices.length).toBeGreaterThan(0)
  })

  it("has unique ids and a story of the day", () => {
    expect(new Set(STORIES.map((story) => story.key)).size).toBe(STORIES.length)
    expect(storyOfTheDay("2026-11-13")).toBe(storyOfTheDay("2026-11-13"))
  })
})
