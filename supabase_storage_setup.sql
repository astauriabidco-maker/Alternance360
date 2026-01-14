-- 1. Création du bucket 'preuves' (public)
insert into storage.buckets (id, name, public)
values ('preuves', 'preuves', true)
on conflict (id) do nothing;

-- 2. Politique : Autoriser les utilisateurs connectés à uploader des fichiers
create policy "Authenticated users can upload proofs"
on storage.objects for insert
to authenticated
with check ( bucket_id = 'preuves' AND auth.role() = 'authenticated' );

-- 3. Politique : Autoriser la lecture publique (nécessaire pour getPublicUrl)
create policy "Public Access to proofs"
on storage.objects for select
to public
using ( bucket_id = 'preuves' );

-- 4. (Optionnel) Autoriser la suppression par le propriétaire (si besoin plus tard)
create policy "Users can delete their own proofs"
on storage.objects for delete
to authenticated
using ( bucket_id = 'preuves' AND auth.uid() = owner );
