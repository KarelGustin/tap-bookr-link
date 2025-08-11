-- Setup script for remote Supabase database
-- Run this in your Supabase dashboard SQL Editor

-- Create profiles table for TapBookr
create table if not exists public.profiles (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null,
  handle text not null unique,
  status text not null default 'draft' check (status in ('draft','published')),
  name text,
  slogan text,
  avatar_url text,
  category text check (category in ('Salon','Pet Groomer','Consultant','Brow','Nails','Other')),
  accent_color text default '#6E56CF',
  theme_mode text not null default 'light' check (theme_mode in ('light','dark')),
  booking_url text,
  booking_mode text not null default 'embed' check (booking_mode in ('embed','new_tab')),
  socials jsonb not null default '{}'::jsonb,
  about jsonb not null default '{}'::jsonb,
  media jsonb not null default '{"items":[]}'::jsonb,
  contact jsonb not null default '{}'::jsonb,
  banner jsonb not null default '{}'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Indexes
create index if not exists idx_profiles_user_id on public.profiles(user_id);
create index if not exists idx_profiles_status on public.profiles(status);

-- Enable RLS
alter table public.profiles enable row level security;

-- Policies
create policy "Public can view published profiles" on public.profiles
for select using (status = 'published');

create policy "Users can view their own profiles" on public.profiles
for select using (auth.uid() = user_id);

create policy "Users can insert their own profiles" on public.profiles
for insert with check (auth.uid() = user_id);

create policy "Users can update their own profiles" on public.profiles
for update using (auth.uid() = user_id);

-- Timestamp trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger
create trigger trg_profiles_updated_at
before update on public.profiles
for each row execute function public.update_updated_at_column();

-- Enforce handle immutability after insert
create or replace function public.prevent_handle_change()
returns trigger as $$
begin
  if tg_op = 'UPDATE' and new.handle is distinct from old.handle then
    raise exception 'Handle is immutable and cannot be changed';
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_handle_immutable
before update on public.profiles
for each row execute function public.prevent_handle_change();

-- Validate publish rules (name + booking_url required when publishing)
create or replace function public.validate_publish_rules()
returns trigger as $$
begin
  if new.status = 'published' then
    if new.name is null or length(trim(new.name)) = 0 then
      raise exception 'Publishing requires a name';
    end if;
    if new.booking_url is null or length(trim(new.booking_url)) = 0 then
      raise exception 'Publishing requires a booking URL';
    end if;
  end if;
  return new;
end;
$$ language plpgsql;

create trigger trg_profiles_validate_publish
before insert or update on public.profiles
for each row execute function public.validate_publish_rules();

-- Storage buckets for avatars and media
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

-- Storage policies for avatars
create policy "Avatar images are publicly accessible" on storage.objects
for select using (bucket_id = 'avatars');

create policy "Users can upload their own avatar" on storage.objects
for insert with check (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own avatar" on storage.objects
for update using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own avatar" on storage.objects
for delete using (
  bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Storage policies for media
create policy "Media is publicly accessible" on storage.objects
for select using (bucket_id = 'media');

create policy "Users can upload their own media" on storage.objects
for insert with check (
  bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can update their own media" on storage.objects
for update using (
  bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
);

create policy "Users can delete their own media" on storage.objects
for delete using (
  bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
);

-- Test the table creation
select 'Profiles table created successfully!' as status;
