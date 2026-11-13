import type { MouseEvent, ReactNode } from "react"

import { distanceKm, villes, type Ville } from "@/geo"
import {
  LABEL_POSITIONS,
  MAP_H,
  MAP_W,
  OUTLINE,
  px,
  py,
  unproject,
} from "@/geo/projection"
import { cn } from "@/lib/cn"

type Point = { lat: number; lon: number }

const radius = (ville: Ville) =>
  ville.chefLieuDe === "district" ? 8 : ville.chefLieuDe ? 6.5 : 5

function Label({ ville }: { ville: Ville }) {
  const position =
    LABEL_POSITIONS[ville.nom] ?? (ville.lon > -3.4 ? "left" : "right")
  const x = px(ville.lon)
  const y = py(ville.lat)
  const props =
    position === "left"
      ? { x: x - 10, y: y + 4, textAnchor: "end" as const }
      : position === "above"
        ? { x, y: y - 11, textAnchor: "middle" as const }
        : position === "below"
          ? { x, y: y + 18, textAnchor: "middle" as const }
          : { x: x + 10, y: y + 4 }
  return (
    <text className="label" {...props}>
      {ville.nom}
    </text>
  )
}

/**
 * The country with its cities. A tap selects the nearest city (`onCity`,
 * within `snapKm`) or gives the tapped point (`onPoint`).
 */
export function CountryMap({
  labels = true,
  showCities = true,
  muted = false,
  labelled,
  cityClass,
  onCity,
  onPoint,
  snapKm = 35,
  under,
  children,
  className,
  label = "Carte des villes de Côte d'Ivoire",
}: {
  labels?: boolean
  showCities?: boolean
  /** All cities in grey, so the highlighted ones stand out. */
  muted?: boolean
  /** Name only these cities. */
  labelled?: Ville[]
  cityClass?: (ville: Ville) => string
  onCity?: (ville: Ville) => void
  onPoint?: (point: Point) => void
  snapKm?: number
  under?: ReactNode
  children?: ReactNode
  className?: string
  label?: string
}) {
  const interactive = !!(onCity || onPoint)

  function handleClick(event: MouseEvent<SVGSVGElement>) {
    const matrix = event.currentTarget.getScreenCTM()
    if (!matrix) return
    const local = new DOMPoint(event.clientX, event.clientY).matrixTransform(
      matrix.inverse()
    )
    const point = unproject(local.x, local.y)
    if (onPoint) onPoint(point)
    if (onCity) {
      const closest = villes
        .map((ville) => ({ ville, km: distanceKm(ville, point) }))
        .sort((a, b) => a.km - b.km)[0]
      if (closest.km <= snapKm) onCity(closest.ville)
    }
  }

  const coast = OUTLINE.slice(17, 24)
    .map(([lon, lat]) => `${px(lon)},${py(lat) + 7}`)
    .join(" ")

  return (
    <svg
      viewBox={`0 0 ${MAP_W} ${MAP_H}`}
      role="img"
      aria-label={label}
      onClick={interactive ? handleClick : undefined}
      className={cn(
        "map-svg block h-auto w-full touch-manipulation select-none",
        interactive && "cursor-crosshair",
        className
      )}
    >
      {[5, 6, 7, 8, 9, 10].map((lat) => (
        <g key={`lat${lat}`}>
          <line className="grat" x1={0} x2={MAP_W} y1={py(lat)} y2={py(lat)} />
          <text className="gratl" x={4} y={py(lat) - 3}>
            {lat}° N
          </text>
        </g>
      ))}
      {[-8, -7, -6, -5, -4, -3].map((lon) => (
        <g key={`lon${lon}`}>
          <line className="grat" y1={0} y2={MAP_H} x1={px(lon)} x2={px(lon)} />
          <text className="gratl" x={px(lon) + 3} y={MAP_H - 4}>
            {-lon}° O
          </text>
        </g>
      ))}
      <polyline className="sea" points={coast} />
      <polygon
        className="country"
        points={OUTLINE.map(([lon, lat]) => `${px(lon)},${py(lat)}`).join(" ")}
      />
      {under}
      {showCities &&
        villes.map((ville) => (
          <circle
            key={ville.id}
            className={cn(
              "city",
              muted ? "dim" : ville.chefLieuDe && "capital",
              cityClass?.(ville)
            )}
            cx={px(ville.lon)}
            cy={py(ville.lat)}
            r={radius(ville)}
            tabIndex={onCity ? 0 : undefined}
            aria-label={onCity ? (labels ? ville.nom : "Une ville") : undefined}
            onKeyDown={
              onCity
                ? (event) => {
                    if (event.key === "Enter" || event.key === " ") {
                      event.preventDefault()
                      onCity(ville)
                    }
                  }
                : undefined
            }
          />
        ))}
      {showCities &&
        labels &&
        (labelled ?? villes.filter((ville) => ville.chefLieuDe)).map(
          (ville) => <Label key={ville.id} ville={ville} />
        )}
      {children}
    </svg>
  )
}

export function Route({ from, to }: { from: Point; to: Point }) {
  return (
    <line
      className="route"
      x1={px(from.lon)}
      y1={py(from.lat)}
      x2={px(to.lon)}
      y2={py(to.lat)}
    />
  )
}

export function Marker({ at, kind }: { at: Point; kind: "guess" | "target" }) {
  return (
    <circle
      className={kind}
      cx={px(at.lon)}
      cy={py(at.lat)}
      r={kind === "guess" ? 7 : 9}
    />
  )
}
