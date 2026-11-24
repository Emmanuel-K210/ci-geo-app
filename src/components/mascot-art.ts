// The quiz mascot, a baby elephant, drawn as an SVG string so the app (React)
// and the video scenes (plain pages) share one drawing.

export type Mood = "idle" | "happy" | "sad" | "think" | "wow"

const SKIN = "#9fb2bf"
const SHADE = "#8399a8"
const LIGHT = "#c3d1da"
const INK = "#17241e"
const ORANGE = "#f77f00"
const GREEN = "#009e60"
const CHEEK = "#f2a19a"

function eyes(mood: Mood): string {
  const shine = (x: number, y: number) =>
    `<circle cx="${x + 3}" cy="${y - 4}" r="3.2" fill="#fff"/><circle cx="${x - 3}" cy="${y + 4}" r="1.4" fill="#fff"/>`
  if (mood === "happy")
    return [72, 128]
      .map(
        (x) =>
          `<path d="M${x - 10} 86 Q${x} 72 ${x + 10} 86" fill="none" stroke="${INK}" stroke-width="5" stroke-linecap="round"/>`
      )
      .join("")
  const ry = mood === "wow" ? 13 : 11
  const rx = mood === "wow" ? 10 : 9
  const dy = mood === "think" ? -4 : 0
  const dx = mood === "think" ? 3 : 0
  return [72, 128]
    .map(
      (x) =>
        `<ellipse cx="${x}" cy="84" rx="${rx + 3}" ry="${ry + 3}" fill="#fff"/>` +
        `<ellipse cx="${x + dx}" cy="${84 + dy}" rx="${rx}" ry="${ry}" fill="${INK}"/>` +
        shine(x + dx, 84 + dy)
    )
    .join("")
}

function brows(mood: Mood): string {
  const line = (d: string) =>
    `<path d="${d}" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
  if (mood === "sad") return line("M60 70 L80 63") + line("M140 70 L120 63")
  if (mood === "think")
    return line("M60 64 Q70 58 82 63") + line("M120 68 L140 68")
  if (mood === "wow")
    return line("M60 60 Q70 54 82 59") + line("M118 59 Q130 54 140 60")
  return ""
}

/** The mouth, under the trunk's root; `open` (0–1) opens it to speak. */
function mouth(mood: Mood, open: number): string {
  if (open > 0.05 || mood === "wow") {
    const ry = mood === "wow" ? 8 : 2 + open * 9
    return `<ellipse cx="80" cy="121" rx="9" ry="${ry}" fill="#5b2a2a"/><ellipse cx="80" cy="${121 + ry * 0.45}" rx="5.5" ry="${ry * 0.4}" fill="#e46f6f"/>`
  }
  if (mood === "happy")
    return `<path d="M68 114 Q80 134 92 116 Z" fill="#5b2a2a"/><path d="M73 122 Q80 129 87 122" fill="#e46f6f"/>`
  if (mood === "sad")
    return `<path d="M70 124 Q80 114 90 124" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
  return `<path d="M69 115 Q79 126 90 117" fill="none" stroke="${INK}" stroke-width="4" stroke-linecap="round"/>`
}

/** The whole mascot; viewBox 200 × 210, drawn facing the viewer. */
export function mascotSvg(mood: Mood = "idle", open = 0): string {
  // The trunk curls up when happy or surprised, droops when sad.
  const trunk =
    mood === "happy" || mood === "wow"
      ? "M100 100 C100 126 108 140 124 136 C136 133 140 120 134 112"
      : mood === "sad"
        ? "M100 100 C100 128 102 146 98 158"
        : "M100 100 C100 130 106 146 122 146 C132 146 136 138 132 132"
  const tip = trunk.split(" ").slice(-2).join(" ")
  return `<svg viewBox="0 0 200 210" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Le bébé éléphant de Culture Ivoire">
  <g class="m-body">
    <ellipse cx="100" cy="204" rx="54" ry="5" fill="${INK}" opacity=".12"/>
    <rect x="66" y="176" width="26" height="28" rx="12" fill="${SHADE}"/>
    <rect x="108" y="176" width="26" height="28" rx="12" fill="${SHADE}"/>
    <path d="M70 200 h18 M112 200 h18" stroke="${LIGHT}" stroke-width="3" stroke-linecap="round"/>
    <ellipse cx="100" cy="168" rx="44" ry="32" fill="${SKIN}"/>
    <ellipse cx="100" cy="176" rx="26" ry="18" fill="${LIGHT}"/>
    <path d="M60 146 Q100 162 140 146 L138 158 Q100 174 62 158 Z" fill="${ORANGE}"/>
    <path d="M70 152 l6 10 M86 156 l4 11 M110 156 l-4 11 M126 152 l-6 10" stroke="#fff" stroke-width="3" stroke-linecap="round"/>
    <path d="M78 155 l3 10 M118 155 l-3 10" stroke="${GREEN}" stroke-width="3" stroke-linecap="round"/>
  </g>
  <g class="m-head">
    <g class="m-ear-l">
      <ellipse cx="40" cy="84" rx="38" ry="44" fill="${SKIN}"/>
      <ellipse cx="44" cy="86" rx="26" ry="32" fill="${ORANGE}"/>
    </g>
    <g class="m-ear-r">
      <ellipse cx="160" cy="84" rx="38" ry="44" fill="${SKIN}"/>
      <ellipse cx="156" cy="86" rx="26" ry="32" fill="${GREEN}"/>
    </g>
    <circle cx="100" cy="86" r="54" fill="${SKIN}"/>
    <path d="M94 34 Q92 22 98 18 M100 33 Q102 20 110 18 M106 34 Q112 26 118 28" fill="none" stroke="${SHADE}" stroke-width="4" stroke-linecap="round"/>
    <circle cx="58" cy="104" r="8" fill="${CHEEK}" opacity=".7"/>
    <circle cx="142" cy="104" r="8" fill="${CHEEK}" opacity=".7"/>
    ${brows(mood)}
    ${eyes(mood)}
    ${mouth(mood, open)}
    <path d="${trunk}" fill="none" stroke="${SHADE}" stroke-width="22" stroke-linecap="round"/>
    <path d="${trunk}" fill="none" stroke="${SKIN}" stroke-width="16" stroke-linecap="round"/>
    <path d="M95 112 h10 M95 124 h10" stroke="${SHADE}" stroke-width="2.5" stroke-linecap="round"/>
    <circle cx="${tip.split(" ")[0]}" cy="${tip.split(" ")[1]}" r="8.5" fill="${LIGHT}"/>
  </g>
</svg>`
}

/** What Zézé says about a result, from a 0–1 rating of the game. */
export function zezeReaction(
  rating: number,
  record = false
): { mood: Mood; line: string } {
  if (record) return { mood: "wow", line: "Waouh, nouveau record !" }
  if (rating >= 0.9) return { mood: "happy", line: "Bravo, tu es fort, hein !" }
  if (rating >= 0.6)
    return { mood: "happy", line: "Bien joué, on est ensemble !" }
  if (rating >= 0.35) return { mood: "think", line: "Pas mal… on remet ça ?" }
  return { mood: "sad", line: "Aïe aïe aïe… on révise un peu ?" }
}
