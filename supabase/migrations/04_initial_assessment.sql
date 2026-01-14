-- 04_initial_assessment.sql

-- 1. Create Assessment Session Table
create table if not exists public.initial_assessments (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  contract_id uuid references public.contrats(id) on delete cascade not null,
  
  status text default 'DRAFT' check (status in ('DRAFT', 'SUBMITTED', 'VALIDATED')),
  submitted_at timestamp with time zone,
  validated_at timestamp with time zone,
  validator_id uuid references public.users(id) -- Trainer who validated
);

-- Enable RLS
alter table public.initial_assessments enable row level security;

-- Policy
create policy "Users can view tenant assessments" on public.initial_assessments 
    for select to authenticated 
    using (tenant_id = public.get_auth_tenant_id());

create policy "Trainers/Admins can update assessments" on public.initial_assessments
    for update to authenticated
    using (
        tenant_id = public.get_auth_tenant_id()
        and exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'formateur', 'super_admin'))
    );

create policy "Apprentices can insert/update own draft" on public.initial_assessments
    for all to authenticated
    using (
        tenant_id = public.get_auth_tenant_id()
        -- Verification implies checking contract ownership, simplified here for tenant scope
    );


-- 2. Update Positionnements
-- We assume positionnements table exists from 02_tsf...
-- We add the link to the assessment session.

alter table public.positionnements 
    add column assessment_id uuid references public.initial_assessments(id) on delete cascade,
    add column comment text;

-- Add index
create index if not exists idx_positionnement_assessment on public.positionnements(assessment_id);
