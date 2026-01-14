-- 1. Création de la table 'profiles'
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null,
  first_name text,
  last_name text,
  phone text,
  company_name text,
  tutor_name text,
  
  constraint username_length check (char_length(first_name) >= 2)
);

-- 2. Activer RLS
alter table public.profiles enable row level security;

-- 3. Policies
create policy "Public profiles are viewable by everyone."
  on profiles for select
  using ( true );

create policy "Users can insert their own profile."
  on profiles for insert
  with check ( auth.uid() = id );

create policy "Users can update own profile."
  on profiles for update
  using ( auth.uid() = id );

-- 4. Trigger pour créer automatiquement un profil à l'inscription (Optionnel mais recommandé)
-- Cela évite d'avoir à gérer la création manuelle du profil côté code
create function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (new.id, new.raw_user_meta_data ->> 'first_name', new.raw_user_meta_data ->> 'last_name');
  return new;
end;
$$;

-- Trigger déclenché après chaque insertion dans auth.users
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();
