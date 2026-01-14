-- 1. Créer une fonction sécurisée pour vérifier le rôle (contourne RLS)
create or replace function public.is_tutor()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from profiles
    where id = auth.uid()
    and role = 'tutor'
  );
$$;

-- 2. Mettre à jour les policies pour utiliser cette fonction
drop policy if exists "Tutors can view all profiles" on public.profiles;
create policy "Tutors can view all profiles"
on public.profiles for select
to authenticated
using ( 
  auth.uid() = id  -- Chacun voit son propre profil
  OR
  is_tutor()       -- Les tuteurs voient tout
);

drop policy if exists "Tutors can view all proofs" on public.activites_preuves;
create policy "Tutors can view all proofs"
on public.activites_preuves for select
to authenticated
using ( 
  auth.uid() = user_id -- Chacun voit ses preuves
  OR
  is_tutor()           -- Les tuteurs voient tout
);

drop policy if exists "Tutors can update proofs" on public.activites_preuves;
create policy "Tutors can update proofs"
on public.activites_preuves for update
to authenticated
using ( 
  is_tutor() 
);
