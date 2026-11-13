import raw from "./ci-geo.json"
import {
  CiGeo,
  distanceKm,
  type CiGeoData,
  type District,
  type Localite,
  type Quartier,
  type Ville,
} from "./ci-geo"

export type { District, Localite, Quartier, Ville }
export { distanceKm }

export const geo = CiGeo.from(raw as unknown as CiGeoData)
export const rawData = raw as unknown as CiGeoData

export const villes = geo.villes
export const localites = villes.flatMap((ville) => ville.localites)
export const quartiers = localites.flatMap((localite) => localite.quartiers)

export function villeById(id: string | undefined): Ville | undefined {
  return id ? geo.ville(id) : undefined
}

function mustVille(id: string): Ville {
  const ville = geo.ville(id)
  if (!ville) throw new Error(`Ville absente du référentiel : ${id}`)
  return ville
}

export const ABIDJAN = mustVille("ci-v-abidjan")
export const YAMOUSSOUKRO = mustVille("ci-v-yamoussoukro")

export const districtById = (id: string | undefined) =>
  geo.districts.find((district) => district.id === id)

export const localiteById = (id: string | undefined) =>
  localites.find((localite) => localite.id === id)

/** The closest cities, nearest first. */
export function nearest(ville: Ville, count = 3) {
  return geo.villesProches(ville.id, count)
}

export const villeKind = (ville: Ville) =>
  ville.chefLieuDe === "district"
    ? "Chef-lieu de district"
    : ville.chefLieuDe === "region"
      ? `Chef-lieu de ${ville.region?.nom}`
      : "Ville"
