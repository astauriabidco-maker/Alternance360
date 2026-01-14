-- 01_referentiels.sql

-- 1. Referentiels Table (RNCP)
create table if not exists public.referentiels (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  code_rncp text not null,
  title text not null,
  description text,
  
  -- Unique RNCP per tenant
  unique(tenant_id, code_rncp)
);

-- 2. Blocs de Competences
create table if not exists public.blocs_competences (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  referentiel_id uuid references public.referentiels(id) on delete cascade not null,
  title text not null,
  order_index integer default 0
);

-- 3. Competences
create table if not exists public.competences (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  tenant_id uuid references public.tenants(id) on delete cascade not null,
  bloc_id uuid references public.blocs_competences(id) on delete cascade not null,
  description text not null,
  code text -- custom code e.g. "C1.2"
);

-- Enable RLS
alter table public.referentiels enable row level security;
alter table public.blocs_competences enable row level security;
alter table public.competences enable row level security;

-- RLS Policies
-- READ: Users can view referentials belonging to their tenant
create policy "Users can view tenant referentiels"
on public.referentiels for select
to authenticated
using ( tenant_id = public.get_auth_tenant_id() );

create policy "Users can view tenant blocs"
on public.blocs_competences for select
to authenticated
using ( tenant_id = public.get_auth_tenant_id() );

create policy "Users can view tenant competences"
on public.competences for select
to authenticated
using ( tenant_id = public.get_auth_tenant_id() );

-- WRITE: Only Admins can manage referentials (Example policy, refine as needed)
create policy "Admins can manage referentiels"
on public.referentiels for all
to authenticated
using ( 
  tenant_id = public.get_auth_tenant_id() 
  and exists (select 1 from public.users where id = auth.uid() and role = 'admin') 
);

-- Indexes
create index if not exists referentiels_tenant_id_idx on public.referentiels(tenant_id);
create index if not exists blocs_tenant_id_idx on public.blocs_competences(tenant_id);
create index if not exists competences_tenant_id_idx on public.competences(tenant_id);
