-- 03_tsf_refactor.sql

-- 1. Create Periods Table
create table if not exists public.contrat_periodes (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  contract_id uuid references public.contrats(id) on delete cascade not null,
  
  order_index integer not null, -- 1, 2, 3...
  label text not null, -- "Période 1", "Semestre 1"
  start_date date not null,
  end_date date not null
);

-- Enable RLS for Periods
alter table public.contrat_periodes enable row level security;

-- Policy (inherited from contract usually, but here simple link)
create policy "Users can view tenant periodes" on public.contrat_periodes 
    for select to authenticated 
    using (exists (
        select 1 from public.contrats c 
        where c.id = contrat_periodes.contract_id 
        and c.tenant_id = public.get_auth_tenant_id()
    ));

-- 2. Refactor TSF Mapping
-- We need to drop the old columns and add the new structure. 
-- WARNING: This deletes existing TSF data. Acceptable for dev phase.

delete from public.tsf_mapping; -- Clear data first

alter table public.tsf_mapping 
    drop column planned_start,
    drop column planned_end,
    drop column lieu;

alter table public.tsf_mapping
    add column period_id uuid references public.contrat_periodes(id) on delete cascade, -- Nullable if status=ACQUIS ? No, keep strict.
    add column flag_cfa boolean default false,
    add column flag_entreprise boolean default false;

-- Add Constraint: One mapping per Competence per Period? 
-- Spec says "Déplacer une compétence d'une période à une autre". 
-- Implies a competence belongs to ONE period principally? 
-- OR can be split? "Dualité CFA/Entreprise pour une période donnée".
-- Let's assume a competence can be planned over multiple periods in theory, 
-- but usually we assign it to one main period for assessment.
-- However, for the Grid UI, unique constraint (contract, competence, period) is safe.
alter table public.tsf_mapping add constraint unique_mapping_cell unique (contract_id, competence_id, period_id);
