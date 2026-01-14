-- 1. Création de la table 'activites_preuves'
create table if not exists public.activites_preuves (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  titre text not null,
  url_fichier text not null,
  type text check (type in ('PDF', 'PHOTO')),
  user_id uuid references auth.users(id) not null,
  tenant_id uuid -- Peut être null si non utilisé, ou ajouter une contrainte si nécessaire
);

-- 2. Activer RLS (Row Level Security)
alter table public.activites_preuves enable row level security;

-- 3. Politique : Les utilisateurs peuvent voir leurs propres preuves
create policy "Users can view their own proofs"
on public.activites_preuves for select
to authenticated
using ( auth.uid() = user_id );

-- 4. Politique : Les utilisateurs peuvent insérer leurs propres preuves
create policy "Users can insert their own proofs"
on public.activites_preuves for insert
to authenticated
with check ( auth.uid() = user_id );

-- 5. (Optionnel) Index pour les performances
create index if not exists activites_preuves_user_id_idx on public.activites_preuves(user_id);
