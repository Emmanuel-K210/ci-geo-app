import { describe, expect, it } from "vitest"

import { mascotSvg, zezeReaction, type Mood } from "@/components/mascot-art"

describe("Zézé", () => {
  it("draws every mood as one SVG", () => {
    for (const mood of ["idle", "happy", "sad", "think", "wow"] as Mood[]) {
      const svg = mascotSvg(mood)
      expect(svg.startsWith("<svg")).toBe(true)
      expect(svg.trim().endsWith("</svg>")).toBe(true)
      expect(svg).not.toContain("undefined")
    }
  })

  it("reacts to the result", () => {
    expect(zezeReaction(1).mood).toBe("happy")
    expect(zezeReaction(0.7).mood).toBe("happy")
    expect(zezeReaction(0.5).mood).toBe("think")
    expect(zezeReaction(0.1).mood).toBe("sad")
    expect(zezeReaction(0.1, true).mood).toBe("wow")
  })
})
