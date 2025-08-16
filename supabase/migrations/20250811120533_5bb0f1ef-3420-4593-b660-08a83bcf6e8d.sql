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
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Public can view published profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Public can view published profiles" ON public.profiles
    FOR SELECT USING (status = 'published');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can view their own profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can view their own profiles" ON public.profiles
    FOR SELECT USING (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can insert their own profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can insert their own profiles" ON public.profiles
    FOR INSERT WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own profiles' AND tablename = 'profiles') THEN
    CREATE POLICY "Users can update their own profiles" ON public.profiles
    FOR UPDATE USING (auth.uid() = user_id);
  END IF;
END $$;

-- Timestamp trigger function
create or replace function public.update_updated_at_column()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

-- Apply updated_at trigger
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_updated_at') THEN
    CREATE TRIGGER trg_profiles_updated_at
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_handle_immutable') THEN
    CREATE TRIGGER trg_profiles_handle_immutable
    BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.prevent_handle_change();
  END IF;
END $$;

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

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'trg_profiles_validate_publish') THEN
    CREATE TRIGGER trg_profiles_validate_publish
    BEFORE INSERT OR UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.validate_publish_rules();
  END IF;
END $$;

-- Storage buckets for avatars and media
insert into storage.buckets (id, name, public)
values ('avatars','avatars', true)
on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
values ('media','media', true)
on conflict (id) do nothing;

-- Storage policies for avatars
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Avatar images are publicly accessible' AND tablename = 'objects') THEN
    CREATE POLICY "Avatar images are publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'avatars');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own avatar' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload their own avatar" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own avatar' AND tablename = 'objects') THEN
    CREATE POLICY "Users can update their own avatar" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own avatar' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete their own avatar" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'avatars' and auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

-- Storage policies for media
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Media is publicly accessible' AND tablename = 'objects') THEN
    CREATE POLICY "Media is publicly accessible" ON storage.objects
    FOR SELECT USING (bucket_id = 'media');
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can upload their own media' AND tablename = 'objects') THEN
    CREATE POLICY "Users can upload their own media" ON storage.objects
    FOR INSERT WITH CHECK (
      bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can update their own media' AND tablename = 'objects') THEN
    CREATE POLICY "Users can update their own media" ON storage.objects
    FOR UPDATE USING (
      bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;

DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE policyname = 'Users can delete their own media' AND tablename = 'objects') THEN
    CREATE POLICY "Users can delete their own media" ON storage.objects
    FOR DELETE USING (
      bucket_id = 'media' and auth.uid()::text = (storage.foldername(name))[1]
    );
  END IF;
END $$;
