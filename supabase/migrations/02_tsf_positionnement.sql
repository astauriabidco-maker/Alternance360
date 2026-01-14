-- 02_tsf_positionnement.sql

-- 1. Indicateurs (Granular metrics for Competences)
create table if not exists public.indicateurs (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  competence_id uuid references public.competences(id) on delete cascade not null,
  label text not null,
  
  -- Prevent duplicates per competence
  unique(competence_id, label)
);

-- 2. TSF Mapping (Tableau Stratégique de Formation)
-- Stores the strategic plan: When and Where a competence is addressed for a contract.
create table if not exists public.tsf_mapping (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  
  -- Note: We haven't created 'contrats' yet in Phase 1, so we create it now or assume it exists.
  -- Based on Roadmap, Contracts are Month 2. BUT TSF depends on it.
  -- DECISION: Create a basic 'contrats' table now to support TSF development.
  contract_id uuid not null, -- FK reference added below after creating contracts table
  competence_id uuid references public.competences(id) on delete cascade not null,
  
  planned_start date,
  planned_end date,
  lieu text check (lieu in ('CFA', 'ENTREPRISE', 'MIXTE')),
  status text default 'PLANIFIE' check (status in ('PLANIFIE', 'EN_COURS', 'ACQUIS', 'NON_ACQUIS'))
);

-- 2b. Contrats (Basic definition for Phase 2 dependency)
create table if not exists public.contrats (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  apprentice_user_id uuid references public.users(id) not null,
  referentiel_id uuid references public.referentiels(id) not null,
  start_date date,
  end_date date
);

-- Add FK back to TSF
alter table public.tsf_mapping 
add constraint tsf_contract_fk foreign key (contract_id) references public.contrats(id) on delete cascade;

-- 3. Positionnements (Diagnostic Initial)
create table if not exists public.positionnements (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null, -- The apprentice
  competence_id uuid references public.competences(id) on delete cascade not null,
  
  level_initial integer, -- e.g., 1-4 scale
  level_target integer,
  date_eval date default current_date
);

-- 4. Preuves (Evidence / Journal de Bord)
create table if not exists public.preuves (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  user_id uuid references public.users(id) on delete cascade not null, -- The uploader (Apprentice)
  competence_id uuid references public.competences(id) on delete cascade not null, -- Linked Skill
  
  url text not null, -- S3/Storage Path
  type text check (type in ('PDF', 'IMG', 'VIDEO', 'LINK')),
  status text default 'PENDING' check (status in ('PENDING', 'VALIDATED', 'REJECTED')),
  
  comment text
);

-- ENABLE RLS
alter table public.indicateurs enable row level security;
alter table public.tsf_mapping enable row level security;
alter table public.contrats enable row level security;
alter table public.positionnements enable row level security;
alter table public.preuves enable row level security;

-- RLS POLICIES (Standard Pattern)

-- Shared "Read Own Tenant" Policy
create policy "Users can view tenant indicateurs" on public.indicateurs for select to authenticated using (tenant_id = public.get_auth_tenant_id());
create policy "Users can view tenant tsf" on public.tsf_mapping for select to authenticated using (tenant_id = public.get_auth_tenant_id());
create policy "Users can view tenant contrats" on public.contrats for select to authenticated using (tenant_id = public.get_auth_tenant_id());
create policy "Users can view tenant positionnements" on public.positionnements for select to authenticated using (tenant_id = public.get_auth_tenant_id());
create policy "Users can view tenant preuves" on public.preuves for select to authenticated using (tenant_id = public.get_auth_tenant_id());

-- Write Policies (Simplified for Phase 2 - Refining in Phase 3)
-- Users can insert their own proofs
create policy "Users can upload proofs" on public.preuves for insert to authenticated with check (tenant_id = public.get_auth_tenant_id() and user_id = auth.uid());

-- Admins/Trainers can manage TSF
create policy "Trainers manage TSF" on public.tsf_mapping for all to authenticated using (
  tenant_id = public.get_auth_tenant_id() 
  and exists (select 1 from public.users where id = auth.uid() and role in ('admin', 'formateur', 'super_admin'))
);

-- Indexing
create index if not exists tsf_contract_idx on public.tsf_mapping(contract_id);
create index if not exists preuves_user_idx on public.preuves(user_id);
create index if not exists position_user_idx on public.positionnements(user_id);
