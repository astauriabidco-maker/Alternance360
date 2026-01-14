-- 00_init_schema.sql

-- 1. Tenants Table (CFA)
create table if not exists public.tenants (
  id uuid default gen_random_uuid() primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  name text not null,
  updated_at timestamp with time zone default timezone('utc'::text, now())
);

-- 2. Users Profile Table (Extends Supabase Auth)
-- This table stores application-specific user data and links to the tenant.
create table if not exists public.users (
  id uuid references auth.users(id) on delete cascade primary key,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  email text not null,
  full_name text,
  role text check (role in ('admin', 'formateur', 'tutor', 'apprentice', 'super_admin')),
  tenant_id uuid references public.tenants(id) on delete cascade,
  
  -- Constraint: Super Admins might not have a tenant, but regular users must (unless pending).
  -- For strict isolation, we assume everyone belongs to a tenant or is a super admin.
  constraint users_tenant_id_check check (
    (role = 'super_admin') or (tenant_id is not null)
  )
);

-- Enable RLS
alter table public.tenants enable row level security;
alter table public.users enable row level security;

-- 3. Helper Function: Get Current Tenant ID
-- This function retrieves the tenant_id from the current user's metadata or profile.
-- Note: Ideally, tenant_id is in JWT app_metadata for performance. 
-- For now, we query the users table for robustness if JWT not populated yet.
create or replace function public.get_auth_tenant_id()
returns uuid
language sql
security definer
stable
as $$
  select tenant_id 
  from public.users 
  where id = auth.uid()
  limit 1;
$$;

-- 4. RLS Policies

-- TENANTS:
-- Super Admins can see all tenants.
-- Users can see their own tenant.
create policy "Users can view their own tenant"
on public.tenants for select
to authenticated
using (
  id = public.get_auth_tenant_id()
  or 
  exists (select 1 from public.users where id = auth.uid() and role = 'super_admin')
);

-- USERS:
-- Users can view other users in the SAME tenant.
create policy "Users can view members of their tenant"
on public.users for select
to authenticated
using (
  tenant_id = public.get_auth_tenant_id()
  or 
  role = 'super_admin'
);

-- Users can update their own profile
create policy "Users can update own profile"
on public.users for update
to authenticated
using ( id = auth.uid() );

-- 5. Trigger to Create User Profile on Signup (Optional but recommended)
-- This ensures every auth.user has a matching public.users entry.
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
as $$
begin
  insert into public.users (id, email, full_name, role, tenant_id)
  values (
    new.id, 
    new.email, 
    new.raw_user_meta_data->>'full_name',
    coalesce(new.raw_user_meta_data->>'role', 'apprentice'), -- Default role
    (new.raw_user_meta_data->>'tenant_id')::uuid -- Must be passed in metadata or null for super_admin
  );
  return new;
end;
$$;

-- Trigger execution
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- Indexing for performance
create index if not exists users_tenant_id_idx on public.users(tenant_id);
create index if not exists users_email_idx on public.users(email);
