// Référentiel géographique de la Côte d'Ivoire : modèle objet au-dessus de
// ci-geo.json, utilisable dans la console, le Control Panel ou une autre app.
//
//   const geo = CiGeo.from(json)
//   geo.villes                         // toutes les villes, triées
//   geo.ville("ci-v-abidjan")?.localites // Abobo, Adjamé, Cocody…
//   geo.quartiersDe("ci-v-bouake")      // les quartiers à afficher après le choix de la ville

export type LocaliteType = "commune" | "sous-prefecture"

export type CiGeoData = {
  version: string
  pays: { code: "CI"; nom: string }
  districts: { id: string; nom: string; autonome: boolean }[]
  regions: {
    id: string
    nom: string
    districtId: string
    chefLieuVilleId: string
  }[]
  villes: {
    id: string
    nom: string
    /** Centre-ville, WGS 84, arrondi au centième de degré (≈ 1 km). */
    lat: number
    lon: number
    districtId: string
    regionId: string | null
    chefLieuDe: "district" | "region" | null
    quartiersComplets: boolean
  }[]
  localites: { id: string; nom: string; type: LocaliteType; villeId: string }[]
  quartiers: { id: string; nom: string; localiteId: string; villeId: string }[]
}

export class District {
  readonly regions: Region[] = []
  readonly villes: Ville[] = []
  readonly id: string
  readonly nom: string
  readonly autonome: boolean

  constructor(id: string, nom: string, autonome: boolean) {
    this.id = id
    this.nom = nom
    this.autonome = autonome
  }
}

export class Region {
  readonly villes: Ville[] = []
  chefLieu!: Ville
  readonly id: string
  readonly nom: string
  readonly district: District

  constructor(id: string, nom: string, district: District) {
    this.id = id
    this.nom = nom
    this.district = district
  }
}

export class Ville {
  readonly localites: Localite[] = []
  readonly id: string
  readonly nom: string
  readonly lat: number
  readonly lon: number
  readonly district: District
  readonly region: Region | null
  readonly chefLieuDe: "district" | "region" | null
  readonly quartiersComplets: boolean

  constructor(
    id: string,
    nom: string,
    lat: number,
    lon: number,
    district: District,
    region: Region | null,
    chefLieuDe: "district" | "region" | null,
    quartiersComplets: boolean
  ) {
    this.id = id
    this.nom = nom
    this.lat = lat
    this.lon = lon
    this.district = district
    this.region = region
    this.chefLieuDe = chefLieuDe
    this.quartiersComplets = quartiersComplets
  }

  /** Tous les quartiers de la ville, toutes localités confondues, triés. */
  get quartiers(): Quartier[] {
    return this.localites
      .flatMap((localite) => localite.quartiers)
      .sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
  }

  /** Vrai quand la ville se découpe en plusieurs communes (Abidjan). */
  get aPlusieursLocalites(): boolean {
    return this.localites.length > 1
  }

  /** Distance à vol d'oiseau en kilomètres (formule de haversine). */
  distanceKm(autre: Ville): number {
    return distanceKm(this, autre)
  }
}

export class Localite {
  readonly quartiers: Quartier[] = []
  readonly id: string
  readonly nom: string
  readonly type: LocaliteType
  readonly ville: Ville

  constructor(id: string, nom: string, type: LocaliteType, ville: Ville) {
    this.id = id
    this.nom = nom
    this.type = type
    this.ville = ville
  }
}

export class Quartier {
  readonly id: string
  readonly nom: string
  readonly localite: Localite

  constructor(id: string, nom: string, localite: Localite) {
    this.id = id
    this.nom = nom
    this.localite = localite
  }

  get ville(): Ville {
    return this.localite.ville
  }

  /** « Angré, Cocody » : le libellé à afficher dans une liste d'Abidjan. */
  get libelle(): string {
    return this.localite.ville.aPlusieursLocalites
      ? `${this.nom}, ${this.localite.nom}`
      : this.nom
  }
}

export class CiGeo {
  private readonly byId = new Map<
    string,
    District | Region | Ville | Localite | Quartier
  >()

  readonly version: string
  readonly districts: District[]
  readonly regions: Region[]
  readonly villes: Ville[]

  private constructor(
    version: string,
    districts: District[],
    regions: Region[],
    villes: Ville[]
  ) {
    this.version = version
    this.districts = districts
    this.regions = regions
    this.villes = villes

    for (const district of districts) this.byId.set(district.id, district)
    for (const region of regions) this.byId.set(region.id, region)
    for (const ville of villes) {
      this.byId.set(ville.id, ville)
      for (const localite of ville.localites) {
        this.byId.set(localite.id, localite)
        for (const quartier of localite.quartiers)
          this.byId.set(quartier.id, quartier)
      }
    }
  }

  static from(data: CiGeoData): CiGeo {
    const districts = new Map(
      data.districts.map((d) => [d.id, new District(d.id, d.nom, d.autonome)])
    )
    const regions = new Map(
      data.regions.map((r) => {
        const region = new Region(
          r.id,
          r.nom,
          required(districts, r.districtId)
        )
        region.district.regions.push(region)
        return [r.id, region]
      })
    )
    const villes = new Map(
      data.villes.map((v) => {
        const ville = new Ville(
          v.id,
          v.nom,
          v.lat,
          v.lon,
          required(districts, v.districtId),
          v.regionId ? required(regions, v.regionId) : null,
          v.chefLieuDe,
          v.quartiersComplets
        )
        ville.district.villes.push(ville)
        ville.region?.villes.push(ville)
        return [v.id, ville]
      })
    )
    for (const r of data.regions)
      required(regions, r.id).chefLieu = required(villes, r.chefLieuVilleId)
    const localites = new Map(
      data.localites.map((l) => {
        const localite = new Localite(
          l.id,
          l.nom,
          l.type,
          required(villes, l.villeId)
        )
        localite.ville.localites.push(localite)
        return [l.id, localite]
      })
    )
    for (const q of data.quartiers) {
      const localite = required(localites, q.localiteId)
      localite.quartiers.push(new Quartier(q.id, q.nom, localite))
    }

    const byName = <T extends { nom: string }>(items: Iterable<T>) =>
      [...items].sort((a, b) => a.nom.localeCompare(b.nom, "fr"))
    return new CiGeo(
      data.version,
      byName(districts.values()),
      byName(regions.values()),
      byName(villes.values())
    )
  }

  ville(id: string): Ville | undefined {
    const item = this.byId.get(id)
    return item instanceof Ville ? item : undefined
  }

  quartier(id: string): Quartier | undefined {
    const item = this.byId.get(id)
    return item instanceof Quartier ? item : undefined
  }

  /** Les quartiers à proposer une fois la ville choisie. */
  quartiersDe(villeId: string): Quartier[] {
    return this.ville(villeId)?.quartiers ?? []
  }

  /** Les villes les plus proches, de la plus proche à la plus lointaine. */
  villesProches(villeId: string, nombre = 3): { ville: Ville; km: number }[] {
    const origine = this.ville(villeId)
    if (!origine) return []
    return this.villes
      .filter((ville) => ville !== origine)
      .map((ville) => ({ ville, km: origine.distanceKm(ville) }))
      .sort((a, b) => a.km - b.km)
      .slice(0, nombre)
  }

  /** Recherche sans tenir compte des accents ni de la casse. */
  rechercherVilles(texte: string): Ville[] {
    const cle = normaliser(texte)
    return this.villes.filter((ville) => normaliser(ville.nom).includes(cle))
  }
}

const RAYON_TERRE_KM = 6371

export function distanceKm(
  a: { lat: number; lon: number },
  b: { lat: number; lon: number }
): number {
  const rad = (degres: number) => (degres * Math.PI) / 180
  const h =
    Math.sin(rad(b.lat - a.lat) / 2) ** 2 +
    Math.cos(rad(a.lat)) *
      Math.cos(rad(b.lat)) *
      Math.sin(rad(b.lon - a.lon) / 2) ** 2
  return 2 * RAYON_TERRE_KM * Math.asin(Math.sqrt(h))
}

function required<T>(map: Map<string, T>, id: string): T {
  const item = map.get(id)
  if (!item) throw new Error(`Référence inconnue : ${id}`)
  return item
}

const normaliser = (texte: string) =>
  texte
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, " ")
    .trim()
