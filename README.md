# CI-Geo

Les villes, communes et quartiers de Côte d'Ivoire : un atlas, une carte et des
jeux. Pensé d'abord pour le téléphone.

```bash
npm install
npm run dev        # http://localhost:5173
npm run build      # dist/ : s'ouvre depuis n'importe quel hébergement statique
npm test
```

## Ce qu'il y a dedans

- **Atlas** : carte schématique des 14 districts, puis région, ville, commune et
  quartiers ; villes les plus proches ; id et JSON à copier.
- **Carte** : les 46 villes à leur position GPS, distance à vol d'oiseau entre
  deux villes.
- **Jeux** :
  - le défi du jour : 5 villes à placer, les mêmes pour tout le monde, résultat
    à partager en carrés ;
  - la ville mystère, avec des indices ;
  - plus près ou plus loin ;
  - le quiz en 6 catégories ;
  - le défi chrono ;
  - la carte à trous ;
  - la boussole.
- **Profil** : points d'expérience, 6 niveaux, 15 badges, sons et vibrations.
  Tout est gardé dans le navigateur (localStorage, clé `ci-geo-progress`).
- **Plus** : la liste complète, des statistiques, les exports (CSV, SQL
  PostgreSQL, JSON) et la démo du sélecteur ville → quartier.

## Données

`src/geo/ci-geo.json`, validé par `src/geo/ci-geo.schema.json`, avec son modèle
objet `src/geo/ci-geo.ts` (mode d'emploi dans `src/geo/README.md`). Le découpage
administratif est complet ; les quartiers ne le sont pas. Les coordonnées sont
celles des centres-villes, arrondies à environ 1 km, et le contour du pays est
simplifié.
"# ci-geo-app" 
