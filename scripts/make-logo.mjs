// Draws the Culture Ivoire logo: the country's silhouette (a simplified
// outline, not a boundary of record) filled with the flag's three bands.
//
//   node scripts/make-logo.mjs     writes public/app-icon.svg, favicon.svg,
//                                  logo-mark.svg (dark outline, for light
//                                  backgrounds) and prints the path
import { writeFileSync } from "node:fs"

const OUTLINE = [
  [-8.2, 10.1],
  [-7.9, 10.3],
  [-7.4, 10.45],
  [-6.95, 10.7],
  [-6.2, 10.5],
  [-5.5, 10.45],
  [-5.1, 10.3],
  [-4.7, 9.75],
  [-4.25, 9.65],
  [-3.65, 9.9],
  [-3.1, 9.75],
  [-2.7, 9.5],
  [-2.5, 8.2],
  [-2.9, 7.9],
  [-3.2, 6.8],
  [-3.1, 6.1],
  [-3.1, 5.4],
  [-2.85, 5.1],
  [-3.7, 5.15],
  [-4.6, 5.2],
  [-5.4, 5.1],
  [-6.2, 4.8],
  [-7, 4.5],
  [-7.55, 4.35],
  [-7.55, 5.1],
  [-7.9, 5.7],
  [-8.4, 6.3],
  [-8.6, 7.0],
  [-8.45, 7.6],
  [-8.45, 8.2],
  [-7.8, 8.5],
  [-7.95, 9.2],
  [-8.2, 9.65],
]

const KX = Math.cos((7.5 * Math.PI) / 180)
const xs = OUTLINE.map(([lon]) => lon * KX)
const ys = OUTLINE.map(([, lat]) => -lat)
const [minX, maxX, minY, maxY] = [
  Math.min(...xs),
  Math.max(...xs),
  Math.min(...ys),
  Math.max(...ys),
]
// Fit the shape in a 100 × 100 box with a margin.
const SIZE = 100
const MARGIN = 14
const scale = (SIZE - 2 * MARGIN) / Math.max(maxX - minX, maxY - minY)
const offX = (SIZE - (maxX - minX) * scale) / 2
const offY = (SIZE - (maxY - minY) * scale) / 2
const points = OUTLINE.map(([lon, lat]) => [
  +(offX + (lon * KX - minX) * scale).toFixed(1),
  +(offY + (-lat - minY) * scale).toFixed(1),
])
const path = `M${points.map((p) => p.join(",")).join("L")}Z`
const left = Math.min(...points.map((p) => p[0]))
const right = Math.max(...points.map((p) => p[0]))
const third = (right - left) / 3

const mark = (id, stroke = "#ffffff") => `
  <clipPath id="${id}"><path d="${path}"/></clipPath>
  <g clip-path="url(#${id})">
    <rect x="${left - 1}" y="0" width="${third + 1}" height="100" fill="#f77f00"/>
    <rect x="${left + third}" y="0" width="${third}" height="100" fill="#ffffff"/>
    <rect x="${left + 2 * third}" y="0" width="${third + 1}" height="100" fill="#009e60"/>
  </g>
  <path d="${path}" fill="none" stroke="${stroke}" stroke-opacity=".9" stroke-width="1.8" stroke-linejoin="round"/>`

const icon = (
  rounded
) => `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">
  <rect width="100" height="100" ${rounded ? 'rx="22"' : ""} fill="#17241e"/>${mark("ci")}
</svg>
`

const root = new URL("../public/", import.meta.url)
// Square, full bleed: the generator rounds and masks it for each platform.
writeFileSync(new URL("app-icon.svg", root), icon(false))
writeFileSync(new URL("favicon.svg", root), icon(true))
writeFileSync(
  new URL("logo-mark.svg", root),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100">${mark("ci", "#17241e")}\n</svg>\n`
)
console.log(JSON.stringify({ path, left, third }))
