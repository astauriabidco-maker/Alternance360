-- 1. Ajouter la colonne 'role' si elle n'existe pas
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'profiles' and column_name = 'role') then
        alter table public.profiles 
        add column role text default 'apprentice' check (role in ('apprentice', 'tutor', 'admin'));
    end if;
end $$;

-- 2. Policies pour les Tuteurs (Drop & Recreate pour éviter les erreurs)
drop policy if exists "Tutors can view all profiles" on public.profiles;
create policy "Tutors can view all profiles"
on public.profiles for select
to authenticated
using ( 
  (select role from public.profiles where id = auth.uid()) = 'tutor'
);

drop policy if exists "Tutors can view all proofs" on public.activites_preuves;
create policy "Tutors can view all proofs"
on public.activites_preuves for select
to authenticated
using ( 
  (select role from public.profiles where id = auth.uid()) = 'tutor'
);

drop policy if exists "Tutors can update proofs" on public.activites_preuves;
create policy "Tutors can update proofs"
on public.activites_preuves for update
to authenticated
using ( 
  (select role from public.profiles where id = auth.uid()) = 'tutor'
);

-- 3. Ajouter le statut aux preuves si nécessaire
do $$
begin
    if not exists (select 1 from information_schema.columns where table_name = 'activites_preuves' and column_name = 'status') then
        alter table public.activites_preuves
        add column status text default 'pending' check (status in ('pending', 'validated', 'rejected')),
        add column feedback text;
    end if;
end $$;
