import { quartiers, rawData, villes } from "@/geo"

const csv = (rows: (string | number | null | undefined)[][]) =>
  rows
    .map((row) =>
      row
        .map((cell) => {
          const text = cell == null ? "" : String(cell)
          return /[",;\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text
        })
        .join(",")
    )
    .join("\n")

const sql = (value: string | null) =>
  value == null ? "NULL" : `'${value.replace(/'/g, "''")}'`

export type ExportKind = "csv-villes" | "csv-quartiers" | "sql" | "json"

export const EXPORTS: Record<
  ExportKind,
  { label: string; file: string; type: string; make: () => string }
> = {
  "csv-villes": {
    label: "CSV villes",
    file: "ci-geo-villes.csv",
    type: "text/csv",
    make: () =>
      csv([
        [
          "id",
          "nom",
          "lat",
          "lon",
          "region",
          "district",
          "chef_lieu_de",
          "quartiers",
        ],
        ...villes.map((v) => [
          v.id,
          v.nom,
          v.lat,
          v.lon,
          v.region?.nom,
          v.district.nom,
          v.chefLieuDe,
          v.quartiers.length,
        ]),
      ]),
  },
  "csv-quartiers": {
    label: "CSV quartiers",
    file: "ci-geo-quartiers.csv",
    type: "text/csv",
    make: () =>
      csv([
        ["id", "nom", "localite", "ville", "region", "district"],
        ...quartiers.map((q) => [
          q.id,
          q.nom,
          q.localite.nom,
          q.ville.nom,
          q.ville.region?.nom,
          q.ville.district.nom,
        ]),
      ]),
  },
  sql: {
    label: "SQL PostgreSQL",
    file: "ci-geo.sql",
    type: "application/sql",
    make: () =>
      [
        `-- Référentiel CI-Geo ${rawData.version} : schéma geo, une table par niveau.`,
        "CREATE SCHEMA IF NOT EXISTS geo;",
        "CREATE TABLE geo.district (id text PRIMARY KEY, nom text NOT NULL, autonome boolean NOT NULL);",
        "CREATE TABLE geo.region (id text PRIMARY KEY, nom text NOT NULL, district_id text NOT NULL REFERENCES geo.district, chef_lieu_ville_id text NOT NULL);",
        "CREATE TABLE geo.ville (id text PRIMARY KEY, nom text NOT NULL, lat numeric(5,2) NOT NULL, lon numeric(5,2) NOT NULL, district_id text NOT NULL REFERENCES geo.district, region_id text REFERENCES geo.region, chef_lieu_de text, quartiers_complets boolean NOT NULL);",
        "CREATE TABLE geo.localite (id text PRIMARY KEY, nom text NOT NULL, type text NOT NULL, ville_id text NOT NULL REFERENCES geo.ville);",
        "CREATE TABLE geo.quartier (id text PRIMARY KEY, nom text NOT NULL, localite_id text NOT NULL REFERENCES geo.localite, ville_id text NOT NULL REFERENCES geo.ville);",
        "",
        ...rawData.districts.map(
          (d) =>
            `INSERT INTO geo.district VALUES (${sql(d.id)}, ${sql(d.nom)}, ${d.autonome});`
        ),
        ...rawData.regions.map(
          (r) =>
            `INSERT INTO geo.region VALUES (${sql(r.id)}, ${sql(r.nom)}, ${sql(r.districtId)}, ${sql(r.chefLieuVilleId)});`
        ),
        ...rawData.villes.map(
          (v) =>
            `INSERT INTO geo.ville VALUES (${sql(v.id)}, ${sql(v.nom)}, ${v.lat}, ${v.lon}, ${sql(v.districtId)}, ${sql(v.regionId)}, ${sql(v.chefLieuDe)}, ${v.quartiersComplets});`
        ),
        ...rawData.localites.map(
          (l) =>
            `INSERT INTO geo.localite VALUES (${sql(l.id)}, ${sql(l.nom)}, ${sql(l.type)}, ${sql(l.villeId)});`
        ),
        ...rawData.quartiers.map(
          (q) =>
            `INSERT INTO geo.quartier VALUES (${sql(q.id)}, ${sql(q.nom)}, ${sql(q.localiteId)}, ${sql(q.villeId)});`
        ),
        "",
        "ALTER TABLE geo.region ADD FOREIGN KEY (chef_lieu_ville_id) REFERENCES geo.ville;",
      ].join("\n"),
  },
  json: {
    label: "JSON",
    file: "ci-geo.json",
    type: "application/json",
    make: () => JSON.stringify(rawData, null, 2),
  },
}
