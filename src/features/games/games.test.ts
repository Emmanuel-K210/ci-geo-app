import { describe, expect, it } from "vitest"

import { cluePoints, cluesFor, guessFeedback } from "@/features/games/clues"
import { isRight, MIN_GAP_KM, nextChallenger } from "@/features/games/closer"
import { compassQuestion } from "@/features/games/compass-game"
import {
  dailyPoints,
  dailyStreak,
  dailyVilles,
  msUntilNextDay,
  shareText,
  square,
} from "@/features/games/daily"
import { makeQuestion, QUIZ_MODES } from "@/features/games/questions"
import { ABIDJAN, distanceKm, geo, villes, YAMOUSSOUKRO } from "@/geo"
import { bearing, direction, sectorMargin } from "@/geo/compass"
import { px, py, unproject } from "@/geo/projection"
import { seededRng } from "@/lib/random"
import { BADGES } from "@/stores/badges"
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
