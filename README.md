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

- **Accueil** : le défi du jour, l'objectif de 50 XP par jour, la série des 7
  derniers jours, le jeu à reprendre, un jeu à découvrir et la ville du jour.
  Trois écrans d'accueil à la première visite.
- **Atlas** : vraie carte des 14 districts, colorés selon les villes déjà
  ouvertes, puis région, ville, commune et
  quartiers ; villes les plus proches. Les id et le JSON à copier s'affichent
  avec le mode développeur (Profil › Réglages).
- **Découvrir** : les 5 grands groupes et 16 peuples (origines, histoire,
  traditions, où ils vivent) et 15 sites à visiter avec leur histoire, un récit
  du jour, et des photos de Wikimedia Commons créditées (chargées depuis
  Wikipédia, gardées une semaine dans le navigateur).
- **Carte** : les 46 villes à leur position GPS, distance à vol d'oiseau entre
  deux villes.
- **Jeux** :
  - le défi du jour : 5 villes à placer, les mêmes pour tout le monde, résultat
    à partager en carrés ;
  - la ville mystère, avec des indices ;
  - plus près ou plus loin ;
  - le quiz en 8 catégories, dont peuples et sites ;
  - le défi chrono ;
  - la carte à trous ;
  - la boussole ;
  - où est ce site ? : la photo d'un lieu célèbre, à placer sur la carte ;
  - le duel : les mêmes 10 questions pour deux joueurs, par un lien.
- **Profil** : points d'expérience, 6 niveaux, 22 badges, sons et vibrations.
  Tout est gardé dans le navigateur (localStorage, clé `ci-geo-progress`) et,
  si un projet Supabase est configuré, en ligne après connexion par lien
  magique.
- **Plus** : la liste complète, des statistiques, les exports (CSV, SQL
  PostgreSQL, JSON) et la démo du sélecteur ville → quartier.

## Application installable

L'app s'installe sur l'écran d'accueil (PWA) et fonctionne hors ligne ; les
photos déjà vues restent en cache. Icônes : `public/app-icon.svg`, régénérées
avec `npm run icons`.

## Données

`src/geo/ci-geo.json`, validé par `src/geo/ci-geo.schema.json`, avec son modèle
objet `src/geo/ci-geo.ts` (mode d'emploi dans `src/geo/README.md`). Le découpage
administratif est complet ; les quartiers ne le sont pas. Les coordonnées sont
celles des centres-villes, arrondies à environ 1 km.

Les limites des districts (`src/geo/shapes.json`) viennent de geoBoundaries
(ADM1, Banque mondiale, CC BY 4.0) et le trait de côte de Natural Earth
(domaine public), simplifiés à environ 1 km par `scripts/geo-shapes.mjs` à
partir des fichiers `_simplified.geojson` de geoBoundaries.

## Sauvegarde en ligne et API

Optionnelles, avec Supabase : connexion par lien magique, progression
synchronisée entre appareils, et API REST publique du référentiel pour d'autres
applications. Mise en place et exemples : [docs/supabase.md](docs/supabase.md).
