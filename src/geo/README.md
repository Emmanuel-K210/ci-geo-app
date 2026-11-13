# Référentiel géographique de la Côte d'Ivoire

| Fichier              | Rôle                                                                                                             |
| -------------------- | ---------------------------------------------------------------------------------------------------------------- |
| `ci-geo.json`        | Les données : 14 districts, 31 régions, 46 villes, 58 localités, 169 quartiers.                                  |
| `ci-geo.schema.json` | Le schéma JSON (draft 2020-12) qui valide le fichier.                                                            |
| `ci-geo.ts`          | Le modèle objet en TypeScript : `District`, `Region`, `Ville`, `Localite`, `Quartier`, et `CiGeo` qui les relie. |

## Hiérarchie

```
District ─┬─ Région ── Ville (chef-lieu ou non) ── Localité ── Quartier
          └─ (district autonome : Abidjan, Yamoussoukro, sans région) ── Ville ── …
```

- **Localité** : une commune ou une sous-préfecture. Abidjan en a 13 (Abobo, Cocody, Yopougon… Anyama, Bingerville, Songon). Les autres villes n'en ont qu'une, qui porte leur nom.
- Les données sont « à plat », chaque élément portant l'id de son parent : elles se chargent telles quelles dans une base ou une API. `quartiers[].villeId` est recopié pour filtrer directement par ville.
- Les ids sont stables : préfixe (`ci-d-`, `ci-r-`, `ci-v-`, `ci-l-`, `ci-q-`) + nom sans accents (`ci-q-abidjan-cocody-angre`). On ajoute des éléments, on ne renomme jamais un id.

## Ville puis quartiers

```ts
import data from "./ci-geo.json"
import { CiGeo, type CiGeoData } from "./ci-geo"

const geo = CiGeo.from(data as CiGeoData)

geo.rechercherVilles("san pe") // [San-Pédro], sans accents ni casse
geo.quartiersDe("ci-v-bouake") // Ahougnansou, Air France, Belleville…
geo.quartiersDe("ci-v-abidjan")[0].libelle // « 220 Logements, Adjamé »
geo.ville("ci-v-abidjan")?.localites // pour un choix Commune → Quartier à Abidjan
```

Une ville sans quartier connu renvoie une liste vide : le champ Quartier reste alors une saisie libre.

## Coordonnées et distances

Chaque ville porte `lat` / `lon` (WGS 84, centre-ville, arrondis au centième de degré, soit environ 1 km).

```ts
const abidjan = geo.ville("ci-v-abidjan")!
abidjan.distanceKm(geo.ville("ci-v-bouake")!) // ≈ 286 km à vol d'oiseau
geo.villesProches("ci-v-abidjan", 3) // Grand-Bassam (33 km), Dabou, Jacqueville
```

`distanceKm(a, b)` est aussi exporté seul (haversine) pour n'importe quel objet `{lat, lon}`. Distance à vol d'oiseau, pas par la route.

Pour PostgreSQL, l'explorateur (onglet Exports) produit un script `CREATE TABLE` + `INSERT` (schéma `geo`) et des CSV des villes et des quartiers.

## Limites

- Le découpage administratif (districts, régions, chefs-lieux) est complet. Les **quartiers ne le sont pas** : ce sont les plus connus des grandes villes, et 35 villes n'en ont encore aucun. Chaque ville porte `quartiersComplets: false` jusqu'à vérification.
- Les coordonnées sont celles des centres-villes, à vérifier avant un usage de précision (livraison, géofencing).
- À compléter et vérifier avec une source de terrain : l'Institut national de la statistique, les mairies, ou OpenStreetMap (licence ODbL, citer « © les contributeurs d'OpenStreetMap »).
