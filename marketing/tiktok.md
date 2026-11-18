# TikTok CI-Geo

Vidéos verticales 1080 × 1920, 30 images/s, dans `marketing/video/out/`.
Elles sont **sans son** : ajoutez un son tendance dans TikTok au moment de
publier (bibliothèque « Sons » de l'app), c'est ce qui aide le plus la portée.

| Vidéo                 | Durée | Idée                                                          |
| --------------------- | ----- | ------------------------------------------------------------- |
| `v1-presentation.mp4` | 22 s  | Présentation : carte, récits, jeux, score partagé             |
| `v2-defi.mp4`         | 24 s  | Le défi du jour joué en vrai : 5 épingles, 480/500            |
| `v3-pokou.mp4`        | 25 s  | Le saviez-vous : la légende d'Abla Pokou et le nom des Baoulé |

## Légendes

### v1 — présentation (à publier en premier)

> Tu connais vraiment la Côte d'Ivoire ? 🇨🇮 J'ai créé une appli gratuite : la carte des 14 districts, l'histoire de nos peuples, des sites à visiter et 10 jeux. Lien dans la bio 👆
>
> #cotedivoire #civ #abidjan #225 #geographie #culture #appli #fyp

### v2 — défi du jour

> 480/500 au défi du jour 🎯 5 villes à placer sur la carte, le même défi pour tout le monde. Tu fais mieux ? Dis-moi ton score en commentaire 👇
>
> #cotedivoire #defi #quiz #geographie #225 #abidjan #fyp

### v3 — le saviez-vous

> D'où vient le nom des Baoulé ? 👑 La légende de la reine Abla Pokou. Et toi, tu connais l'histoire de ton peuple ? 16 peuples et 15 sites à découvrir sur CI-Geo.
>
> #cotedivoire #histoire #baoule #ablapokou #culture #225 #lesaviezvous #fyp

## Conseils

- **Lien** : sur TikTok, le lien cliquable dans la bio demande un compte
  professionnel (gratuit, Paramètres › Compte › Passer à un compte
  professionnel). Sinon, l'adresse `ci-geo-app.vercel.app` est écrite à la fin
  de chaque vidéo.
- **Couverture** : choisissez une image forte comme miniature (« Tu connais
  vraiment la Côte d'Ivoire ? », le score 480/500, ou « Le saviez-vous ? »).
- **Rythme** : une vidéo tous les 2 à 3 jours ; répondez aux commentaires avec
  une vidéo (le défi du lendemain, un autre peuple, un autre site).
- **Série** : « Le saviez-vous » se décline pour chaque peuple et chaque site ;
  dites-moi lesquels, je génère les vidéos.

## Vidéos automatiques (2 par jour)

Un lot de vidéos se génère en une commande, avec légendes et programme :

```bash
npm run build
npx vite preview --port 4173
npm run videos -- 2026-11-19 21    # 21 jours à partir du 19/11 : 42 vidéos
```

Résultat dans `marketing/video/out/lot-<date>/` :

- les MP4, nommés `date-1-defi.mp4` (12 h 30) et `date-2-….mp4` (19 h 30) ;
- `programme.md` : pour chaque vidéo, la date, l'heure et la légende à coller ;
- `programme.csv` : la même chose pour un tableur.

Les formats, tirés automatiquement des données de l'app :

| Format                     | Contenu                                                                                     |
| -------------------------- | ------------------------------------------------------------------------------------------- |
| Défi du jour (chaque midi) | Les 5 villes du jour, les mêmes que dans l'app, puis les réponses de la veille sur la carte |
| Devine la ville            | Point mystère sur la carte, indice, 3-2-1, réponse                                          |
| Le saviez-vous             | Un peuple ou un site : photo créditée, histoire, « à savoir »                               |
| Quiz éclair                | 5 questions de 3 secondes (chefs-lieux, régions, districts, peuples, sites)                 |

Programmer dans TikTok Studio (ordinateur, tiktok.com/tiktokstudio) :
Importer, choisir le fichier, coller la légende, ajouter un son, puis
« Programmer » (jusqu'à 10 jours à l'avance). Un lot interrompu reprend où il
s'était arrêté : relancez la même commande.

## Refaire les vidéos

```bash
npm run build
npx vite preview --port 4173
node marketing/video/render.mjs            # les trois, environ 5 minutes
node marketing/video/render.mjs v2-defi    # une seule
```

Le défi du jour est rejoué à la date du rendu : la vidéo v2 montre les villes
de ce jour-là.
