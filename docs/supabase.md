# Supabase : sauvegarde en ligne et API du référentiel

Sans configuration, CI-Geo reste 100 % local. Avec un projet Supabase :

- les joueurs se connectent par **lien magique** (ou code reçu par e-mail) et
  retrouvent leur progression sur tous leurs appareils ;
- vos autres applications lisent les districts, régions, villes, communes et
  quartiers par une **API REST publique en lecture seule**.

## Mise en place (une fois)

1. Créez un projet sur [supabase.com](https://supabase.com).
2. **SQL Editor** : exécutez
   `supabase/migrations/20261113000000_ci_geo.sql`, puis `supabase/seed.sql`.
   Après chaque mise à jour de `src/geo/ci-geo.json`, régénérez le seed avec
   `npm run db:seed` et exécutez-le de nouveau (il met à jour sans dupliquer).
   Avec la CLI Supabase : `supabase link` puis `supabase db push`.
3. **Authentication › URL Configuration** : mettez l'adresse publique de l'app
   dans _Site URL_ et ajoutez-la (ainsi que `http://localhost:5173/`) aux
   _Redirect URLs_.
4. **Authentication › Email Templates › Magic Link** : ajoutez le code pour
   ceux qui lisent leurs e-mails sur un autre appareil, par exemple
   `<p>Ou saisissez ce code dans CI-Geo : <b>{{ .Token }}</b></p>`.
5. Copiez `.env.example` en `.env` et remplissez `VITE_SUPABASE_URL` et
   `VITE_SUPABASE_ANON_KEY` (**Project Settings › API**). Relancez
   `npm run dev` ou `npm run build`.

La clé `anon` est publique par conception : la sécurité repose sur les règles
RLS de la migration (référentiel en lecture seule, chaque joueur ne voit que sa
propre sauvegarde). Ne mettez jamais la clé `service_role` dans l'app.

## Sauvegarde

Table `progress` : une ligne par compte (`user_id`, `data` en JSON,
`updated_at`). À la connexion, la sauvegarde du compte et celle de l'appareil
sont fusionnées sans rien perdre (meilleurs scores, badges, villes visitées,
défis joués) ; ensuite chaque changement est envoyé après 3 secondes. Les
réglages (sons, vibrations, mode développeur) restent propres à l'appareil.

## API du référentiel

Base : `https://<projet>.supabase.co/rest/v1`, en-tête `apikey: <clé anon>`.
Syntaxe des filtres : [PostgREST](https://postgrest.org/en/stable/references/api/tables_views.html).

| Ressource       | Contenu                                                                                     |
| --------------- | ------------------------------------------------------------------------------------------- |
| `districts`     | `id`, `nom`, `autonome`                                                                     |
| `regions`       | `id`, `nom`, `district_id`, `chef_lieu_ville_id`                                            |
| `villes`        | `id`, `nom`, `lat`, `lon`, `district_id`, `region_id`, `chef_lieu_de`, `quartiers_complets` |
| `villes_detail` | une ville avec les noms de sa région et de son district, et son nombre de quartiers         |
| `localites`     | `id`, `nom`, `type` (`commune`, `sous-prefecture`), `ville_id`                              |
| `quartiers`     | `id`, `nom`, `localite_id`, `ville_id`                                                      |

```bash
# Toutes les villes, triées
curl "$URL/rest/v1/villes?select=id,nom,lat,lon&order=nom" -H "apikey: $KEY"

# Les villes d'une région, avec le nom du district
curl "$URL/rest/v1/villes_detail?region_id=eq.ci-r-gbeke" -H "apikey: $KEY"

# Le sélecteur ville → commune → quartier en un appel
curl "$URL/rest/v1/villes?id=eq.ci-v-abidjan&select=nom,localites(id,nom,quartiers(id,nom))" -H "apikey: $KEY"

# Les 5 villes les plus proches de Bouaké
curl -X POST "$URL/rest/v1/rpc/villes_proches" -H "apikey: $KEY" \
  -H "Content-Type: application/json" -d '{"ville_id":"ci-v-bouake","nombre":5}'

# Recherche sans accents ni majuscules
curl -X POST "$URL/rest/v1/rpc/rechercher_villes" -H "apikey: $KEY" \
  -H "Content-Type: application/json" -d '{"texte":"seguela"}'
```

En JavaScript :

```ts
import { createClient } from "@supabase/supabase-js"

const geo = createClient(URL, KEY)
const { data } = await geo
  .from("villes")
  .select("id, nom, localites(id, nom, quartiers(id, nom))")
  .eq("id", "ci-v-abidjan")
  .single()
```

Les identifiants (`ci-v-…`, `ci-q-…`) sont stables : enregistrez-les dans vos
applications plutôt que les noms.
