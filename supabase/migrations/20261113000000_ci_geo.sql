-- CI-Geo: the geographic reference (public, read-only API) and the players'
-- saved progress (one row per account, private).

-- Reference ---------------------------------------------------------------

create table public.districts (
  id text primary key,
  nom text not null,
  autonome boolean not null
);

create table public.regions (
  id text primary key,
  nom text not null,
  district_id text not null references public.districts,
  chef_lieu_ville_id text not null
);

create table public.villes (
  id text primary key,
  nom text not null,
  lat numeric(5, 2) not null,
  lon numeric(5, 2) not null,
  district_id text not null references public.districts,
  region_id text references public.regions,
  chef_lieu_de text check (chef_lieu_de in ('district', 'region')),
  quartiers_complets boolean not null
);

alter table public.regions
  add constraint regions_chef_lieu_fk
  foreign key (chef_lieu_ville_id) references public.villes
  deferrable initially deferred;

create table public.localites (
  id text primary key,
  nom text not null,
  type text not null check (type in ('commune', 'sous-prefecture')),
  ville_id text not null references public.villes
);

create table public.quartiers (
  id text primary key,
  nom text not null,
  localite_id text not null references public.localites,
  ville_id text not null references public.villes
);

create index on public.regions (district_id);
create index on public.villes (district_id);
create index on public.villes (region_id);
create index on public.localites (ville_id);
create index on public.quartiers (localite_id);
create index on public.quartiers (ville_id);

-- Anyone can read the reference; only the service role writes it.
alter table public.districts enable row level security;
alter table public.regions enable row level security;
alter table public.villes enable row level security;
alter table public.localites enable row level security;
alter table public.quartiers enable row level security;

create policy "reference is public" on public.districts for select using (true);
create policy "reference is public" on public.regions for select using (true);
create policy "reference is public" on public.villes for select using (true);
create policy "reference is public" on public.localites for select using (true);
create policy "reference is public" on public.quartiers for select using (true);

-- A city with the names of its region and district, for simple clients.
create view public.villes_detail
with (security_invoker = true) as
select
  v.id,
  v.nom,
  v.lat,
  v.lon,
  v.chef_lieu_de,
  v.region_id,
  r.nom as region,
  v.district_id,
  d.nom as district,
  (select count(*) from public.quartiers q where q.ville_id = v.id)::int
    as quartiers
from public.villes v
join public.districts d on d.id = v.district_id
left join public.regions r on r.id = v.region_id;

-- Great-circle distance in kilometres (haversine), as in the app.
create function public.distance_km(
  lat1 double precision,
  lon1 double precision,
  lat2 double precision,
  lon2 double precision
) returns double precision
language sql immutable parallel safe
as $$
  select 2 * 6371 * asin(sqrt(
    sin(radians(lat2 - lat1) / 2) ^ 2
    + cos(radians(lat1)) * cos(radians(lat2)) * sin(radians(lon2 - lon1) / 2) ^ 2
  ))
$$;

-- The closest cities to a city: POST /rest/v1/rpc/villes_proches.
create function public.villes_proches(ville_id text, nombre int default 3)
returns table (id text, nom text, km double precision)
language sql stable
set search_path = public
as $$
  select v.id, v.nom, round(distance_km(o.lat, o.lon, v.lat, v.lon)::numeric, 1)::double precision
  from villes o
  join villes v on v.id <> o.id
  where o.id = villes_proches.ville_id
  order by 3
  limit least(greatest(nombre, 1), 50)
$$;

-- Accent- and case-insensitive search: POST /rest/v1/rpc/rechercher_villes.
create extension if not exists unaccent with schema extensions;

create function public.rechercher_villes(texte text)
returns setof public.villes
language sql stable
set search_path = public, extensions
as $$
  select *
  from villes
  where unaccent(lower(nom)) like '%' || unaccent(lower(texte)) || '%'
  order by nom
  limit 50
$$;

-- Saved progress ------------------------------------------------------------

create table public.progress (
  user_id uuid primary key references auth.users on delete cascade,
  data jsonb not null,
  updated_at timestamptz not null default now()
);

alter table public.progress enable row level security;

create policy "own progress: read" on public.progress
  for select to authenticated using ((select auth.uid()) = user_id);
create policy "own progress: insert" on public.progress
  for insert to authenticated with check ((select auth.uid()) = user_id);
create policy "own progress: update" on public.progress
  for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);
create policy "own progress: delete" on public.progress
  for delete to authenticated using ((select auth.uid()) = user_id);
