-- 06_journal_2.0.sql

-- 1. Main table for Journal Entries
create table public.activites_journal (
    id uuid default gen_random_uuid() primary key,
    tenant_id uuid not null references public.tenants(id) on delete cascade,
    user_id uuid not null references auth.users(id) on delete cascade, -- The apprentice
    date_activite date not null default current_date,
    titre text not null,
    description text,
    outils_utilises text[], -- Array of tools
    
    -- Analysis Reflexive (Qualiopi)
    reflexion_appris text,
    reflexion_difficultes text,
    
    -- Validation & Audit
    tutor_validated_at timestamptz,
    tutor_id uuid references auth.users(id), -- The Tutor/MA
    tutor_signature_svg text, -- Store signature path or small SVG
    tutor_note text, -- Evaluation marker: 'ACQUIS', 'EN_COURS', 'NON_VU'
    
    created_at timestamptz default now(),
    updated_at timestamptz default now()
);

-- 2. Link between activities and skills (N-N)
create table public.activite_competences (
    activite_id uuid references public.activites_journal(id) on delete cascade,
    competence_id uuid references public.competences(id) on delete cascade,
    primary key (activite_id, competence_id)
);

-- 3. RLS Policies
alter table public.activites_journal enable row level security;
alter table public.activite_competences enable row level security;

-- Policies for activities_journal
create policy "Apprentices can manage their own journal"
    on public.activites_journal for all
    using (user_id = auth.uid())
    with check (user_id = auth.uid());

create policy "Tutors can view and validate their apprentices activities"
    on public.activites_journal for update
    using (true) -- Logic for checking linkage to be added in RBAC
    with check (true);

create policy "Trainers can view all activities in tenant"
    on public.activites_journal for select
    using (tenant_id = public.get_auth_tenant_id());

-- Automate updated_at
create trigger set_updated_at_journal
    before update on public.activites_journal
    for each row execute function public.handle_updated_at();
