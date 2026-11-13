// Builds src/geo/shapes.json, the district outlines drawn on the maps, from the
// simplified geoBoundaries files (gbOpen, CIV):
//   ADM1 — 14 districts, CC BY 4.0, World Bank
//   ADM0 — country, public domain, Natural Earth (only for the coast line)
//
//   node scripts/geo-shapes.mjs <folder with ADM0.geojson and ADM1.geojson>
import { readFileSync, writeFileSync } from "node:fs"
import { join } from "node:path"

const folder = process.argv[2]
if (!folder) throw new Error("Usage: node scripts/geo-shapes.mjs <folder>")
const read = (name) => JSON.parse(readFileSync(join(folder, name), "utf8"))

/** Degrees: about 0.9 km, under 1.5 px on the 560 px wide map. */
const TOLERANCE = 0.008
const round = (value) => Math.round(value * 1000) / 1000

// Douglas–Peucker on one ring.
function simplify(points, tolerance) {
  if (points.length < 4) return points
  const keep = new Uint8Array(points.length)
  keep[0] = keep[points.length - 1] = 1
  const stack = [[0, points.length - 1]]
  while (stack.length) {
    const [first, last] = stack.pop()
    const [ax, ay] = points[first]
    const [bx, by] = points[last]
    const dx = bx - ax
    const dy = by - ay
    const length = Math.hypot(dx, dy) || 1e-12
    let farthest = -1
    let distance = 0
    for (let i = first + 1; i < last; i++) {
      const [px, py] = points[i]
      const d = Math.abs(dy * px - dx * py + bx * ay - by * ax) / length
      if (d > distance) {
        distance = d
        farthest = i
      }
    }
    if (distance > tolerance) {
      keep[farthest] = 1
      stack.push([first, farthest], [farthest, last])
    }
  }
  return points.filter((_, i) => keep[i])
}

/** A closed ring starts and ends on the same point: cut it in two halves at
 * the point farthest from the start, so the line between ends is not empty. */
function simplifyRing(points) {
  const [x0, y0] = points[0]
  let cut = 1
  for (let i = 1; i < points.length; i++)
    if (
      Math.hypot(points[i][0] - x0, points[i][1] - y0) >
      Math.hypot(points[cut][0] - x0, points[cut][1] - y0)
    )
      cut = i
  return [
    ...simplify(points.slice(0, cut + 1), TOLERANCE),
    ...simplify(points.slice(cut), TOLERANCE).slice(1),
  ]
}

const ring = (points) =>
  simplifyRing(points).map(([lon, lat]) => [round(lon), round(lat)])

/** Outer rings only: no district has holes worth drawing at this scale. */
const outerRings = (geometry) =>
  geometry.type === "Polygon"
    ? [ring(geometry.coordinates[0])]
    : geometry.coordinates.map((polygon) => ring(polygon[0]))

const normalize = (text) =>
  text
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .replace(/district autonome d(e|')\s*/, "")
    .replace(/[^a-z]+/g, "")

const data = JSON.parse(
  readFileSync(new URL("../src/geo/ci-geo.json", import.meta.url), "utf8")
)
// geoBoundaries spells « Valle Du Bandama ».
const ALIASES = { valledubandama: "valleedubandama" }
const idByName = new Map(data.districts.map((d) => [normalize(d.nom), d.id]))

const districts = {}
for (const feature of read("ADM1.geojson").features) {
  const key = normalize(feature.properties.shapeName)
  const id = idByName.get(ALIASES[key] ?? key)
  if (!id) throw new Error(`Unknown district: ${feature.properties.shapeName}`)
  districts[id] = outerRings(feature.geometry)
}
const missing = data.districts.filter((d) => !districts[d.id])
if (missing.length)
  throw new Error(`No outline for ${missing.map((d) => d.nom).join(", ")}`)

// The coast: the stretch of the country outline along the Gulf of Guinea.
const country = read("ADM0.geojson").features[0].geometry
const outline = outerRings(country).sort((a, b) => b.length - a.length)[0]
// South of 5.45° N, from the Cavally mouth at Tabou to the Ghana border,
// leaving out both land borders: the longest such stretch is the seaside.
const isCoast = ([lon, lat]) =>
  lat < 5.45 &&
  lon > -7.6 &&
  lon < -2.9 &&
  (lon > -7.3 || lat < 4.6) &&
  (lon < -3.2 || lat < 5.15)
let coast = []
let run = []
for (const point of [...outline, ...outline]) {
  if (isCoast(point)) run.push(point)
  else run = []
  if (run.length > coast.length && run.length <= outline.length)
    coast = [...run]
}

const shapes = {
  source:
    "geoBoundaries gbOpen CIV : ADM1 (Banque mondiale, CC BY 4.0) et ADM0 (Natural Earth, domaine public)",
  districts,
  coast,
}
writeFileSync(
  new URL("../src/geo/shapes.json", import.meta.url),
  JSON.stringify(shapes)
)
const points = Object.values(districts).flat(2).length
console.log(
  `src/geo/shapes.json: ${Object.keys(districts).length} districts, ${points} points, coast ${coast.length} points`
)
