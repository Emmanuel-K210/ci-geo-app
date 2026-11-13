# CLAUDE.md

CI-Geo : atlas et jeux sur la géographie de la Côte d'Ivoire. SPA **mobile first**.

## Stack

Vite + React 19 + TypeScript 7 (strict, `erasableSyntaxOnly` : pas de propriétés
de paramètres), TanStack Router (routes par fichiers dans `src/routes/`, historique
par hash pour fonctionner sur tout hébergement statique), Tailwind CSS v4, zustand
(progression persistée), zod (paramètres d'URL), lucide-react, sonner, vitest,
oxlint, Prettier.

```bash
npm run dev | build | typecheck | lint | test | format
```

Avant de considérer un changement terminé : `typecheck`, `lint`, `test`,
`format:check` et `build` passent.

## Structure

```
src/
  geo/            # données (ci-geo.json), modèle objet (ci-geo.ts), projection, boussole
  features/       # atlas, carte, games, profile, more : pages et logique
  features/games/ # logique pure testée (daily.ts, clues.ts, closer.ts, compass-game.ts,
                  # questions.ts) + une page par jeu
  stores/         # progress.ts (XP, records, badges, réglages), badges.ts, levels.ts
  components/     # app-shell (en-tête + barre du bas), country-map (SVG), ui
  routes/         # fichiers de route fins ; routeTree.gen.ts est généré
```

## Règles

- Mobile d'abord : cibles tactiles de 44 px minimum, barre de navigation en bas
  (`lg:` passe au menu en haut), `pb-nav` pour laisser la place à la barre.
- Couleurs uniquement par les tokens de `styles.css` (`bg-paper`, `text-muted`,
  `bg-orange`…), clair et sombre. Ne pas mettre deux classes concurrentes
  (`bg-surface` et `bg-green-soft`) : choisir l'une ou l'autre selon l'état.
- Un jeu terminé passe par `useFinish().finish(event)` : il enregistre la partie,
  calcule XP, record et badges, et l'annonce.
- Tirages aléatoires par `lib/random.ts` ; le défi du jour est tiré avec une
  graine fixée par la date UTC (l'heure d'Abidjan).
- Textes affichés en français ; code, noms et commentaires en anglais.
- Commits : Conventional Commits en anglais, aucune mention d'IA.
