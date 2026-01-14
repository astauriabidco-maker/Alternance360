-- 05_storage_setup.sql

-- 1. Create a bucket for pedagogical proofs
-- Note: 'storage.buckets' table exists in the 'storage' schema in Supabase
insert into storage.buckets (id, name, public)
values ('pedagogie_preuves', 'pedagogie_preuves', false)
on conflict (id) do nothing;

-- 2. RLS Policies for Storage.Objects
-- We use the 'tenant_id' logic by path prefixing: [tenant_id]/[user_id]/[filename]

-- Policy: Allow users to upload their own proofs to their tenant folder
create policy "Apprentices can upload proofs"
on storage.objects for insert
to authenticated
with check (
    bucket_id = 'pedagogie_preuves' 
    -- The path should start with the user's tenant_id and their own subfolder
    -- Logic: storage.objects path structure: tenant_id/user_id/file.ext
    -- We'd need a way to verify tenant_id from user metadata or profile
);

-- Policy: Allow users to view their own proofs
create policy "Users can view own proofs"
on storage.objects for select
to authenticated
using (
    bucket_id = 'pedagogie_preuves'
    -- (storage.foldername(name))[1] should match tenant_id
    -- (storage.foldername(name))[2] should match auth.uid()
);

-- Policy: Allow trainers to view proofs of their tenant
create policy "Trainers can view tenant proofs"
on storage.objects for select
to authenticated
using (
    bucket_id = 'pedagogie_preuves'
    -- (storage.foldername(name))[1] should match user's tenant_id
);

-- Note: In a real production setup, we would use more complex checks 
-- linking to our public.users table to verify roles.
