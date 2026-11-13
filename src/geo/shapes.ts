import shapes from "./shapes.json"
import { px, py } from "./projection"

// District outlines from geoBoundaries (ADM1, World Bank, CC BY 4.0), made
// lighter by scripts/geo-shapes.mjs; the coast line comes from Natural Earth.

type Ring = number[][]

const path = (rings: Ring[]) =>
  rings
    .map(
      (ring) =>
        `M${ring.map(([lon, lat]) => `${px(lon).toFixed(1)},${py(lat).toFixed(1)}`).join("L")}Z`
    )
    .join("")

/** One SVG path per district, in map coordinates. */
export const DISTRICT_PATHS: { id: string; d: string }[] = Object.entries(
  shapes.districts as Record<string, Ring[]>
).map(([id, rings]) => ({ id, d: path(rings) }))

/** The seaside, from Tabou eastwards. */
export const COAST: [number, number][] = (shapes.coast as Ring).map(
  ([lon, lat]) => [lon, lat]
)

export const SHAPES_SOURCE = shapes.source
