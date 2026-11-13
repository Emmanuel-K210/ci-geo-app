// A decorative map for the posters: the 14 districts and the cities, from the
// same data as the app (district outlines: geoBoundaries, CC BY 4.0).
import { readFileSync, writeFileSync } from "node:fs"

const root = new URL("..", import.meta.url)
const shapes = JSON.parse(readFileSync(new URL("src/geo/shapes.json", root)))
const data = JSON.parse(readFileSync(new URL("src/geo/ci-geo.json", root)))

const B = { west: -8.75, east: -2.35, south: 4.15, north: 10.85 }
const KX = Math.cos((7.5 * Math.PI) / 180)
const W = 560
const H = Math.round((W * (B.north - B.south)) / ((B.east - B.west) * KX))
const px = (lon) => ((lon - B.west) / (B.east - B.west)) * W
const py = (lat) => ((B.north - lat) / (B.north - B.south)) * H

const tints = ["#d9ecdf", "#c4e2cf", "#aed7be", "#98cbab", "#82c09a"]
const paths = Object.values(shapes.districts)
  .map((rings, i) => {
    const d = rings
      .map(
        (ring) =>
          `M${ring.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join("L")}Z`
      )
      .join("")
    return `<path d="${d}" fill="${tints[i % tints.length]}" stroke="#ffffff" stroke-width="1.6" stroke-linejoin="round"/>`
  })
  .join("")
const edge = Object.values(shapes.districts)
  .map((rings) =>
    rings
      .map(
        (ring) =>
          `M${ring.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join("L")}Z`
      )
      .join("")
  )
  .join("")
const cities = data.villes
  .map(
    (v) =>
      `<circle cx="${px(v.lon).toFixed(1)}" cy="${py(v.lat).toFixed(1)}" r="${v.chefLieuDe === "district" ? 6 : 4}" fill="${v.chefLieuDe === "district" ? "#e0680a" : "#ffffff"}" stroke="${v.chefLieuDe === "district" ? "#ffffff" : "#0b7a4b"}" stroke-width="2"/>`
  )
  .join("")
const coast = shapes.coast
  .map(([lon, lat]) => `${px(lon).toFixed(1)},${(py(lat) + 9).toFixed(1)}`)
  .join(" ")

const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${W} ${H}">
<polyline points="${coast}" fill="none" stroke="#7fb6cf" stroke-width="7" stroke-dasharray="2 9" stroke-linecap="round"/>
<path d="${edge}" fill="none" stroke="#0b7a4b" stroke-width="7" stroke-linejoin="round"/>
${paths}${cities}</svg>`

writeFileSync(process.argv[2], svg)
