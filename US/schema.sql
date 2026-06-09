-- ============================================
-- "Us" App — No-Auth Schema
-- Run this entire file in Supabase SQL Editor
-- ============================================

-- Drop everything cleanly (dependency order)
drop table if exists daily_answers cascade;
drop table if exists moods cascade;
drop table if exists journal_entries cascade;
drop table if exists love_notes cascade;
drop table if exists cycle_logs cascade;
drop table if exists saved_links cascade;
drop table if exists bucket_list cascade;
drop table if exists wishlist_items cascade;
drop table if exists plans cascade;
drop table if exists tasks cascade;
drop table if exists events cascade;
drop table if exists couple_invites cascade;
drop table if exists profiles cascade;
drop table if exists couples cascade;

-- Drop old trigger if exists
drop trigger if exists on_auth_user_created on auth.users;
drop function if exists public.handle_new_user();

-- ============================================
-- Tables
-- ============================================

create table couples (
  id text primary key,
  couple_name text,
  cover_photo_url text,
  anniversary_date date,
  partner1_id text,
  partner2_id text,
  created_at timestamptz default now() not null
);

create table profiles (
  id text primary key,
  display_name text,
  avatar_url text,
  role text,
  couple_id text references couples(id) on delete set null,
  created_at timestamptz default now() not null
);

create table events (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  created_by text not null,
  title text not null,
  date date not null,
  time text,
  location text,
  category text default 'important',
  notes text,
  created_at timestamptz default now() not null
);

create table plans (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  created_by text not null,
  title text not null,
  description text,
  status text default 'dream',
  priority_order integer default 0,
  linked_wishlist_id uuid,
  image_url text,
  notes text,
  created_at timestamptz default now() not null
);

create table tasks (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  created_by text not null,
  title text not null,
  description text,
  due_date date,
  assigned_to text default 'both',
  priority text default 'medium',
  is_done boolean default false,
  is_private boolean default false,
  repeat_rule text,
  category text,
  created_at timestamptz default now() not null
);

create table wishlist_items (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  owner_id text not null,
  title text not null,
  description text,
  link text,
  image_url text,
  price_range text,
  priority integer default 1,
  category text default 'occasion',
  claimed_by text,
  created_at timestamptz default now() not null
);

create table bucket_list (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  created_by text not null,
  title text not null,
  description text,
  link text,
  image_url text,
  status text default 'dream',
  completed_at timestamptz,
  created_at timestamptz default now() not null
);

create table saved_links (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  saved_by text not null,
  url text not null,
  title text,
  thumbnail_url text,
  note text,
  category text,
  created_at timestamptz default now() not null
);

create table cycle_logs (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  period_start date not null,
  period_end date,
  symptoms text,
  mood text,
  notes text,
  created_at timestamptz default now() not null
);

create table love_notes (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  from_id text not null,
  to_id text not null,
  text text not null,
  image_url text,
  mood text,
  is_read boolean default false,
  created_at timestamptz default now() not null
);

create table journal_entries (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  author_id text not null,
  text text not null,
  image_url text,
  created_at timestamptz default now() not null
);

create table moods (
  id uuid default gen_random_uuid() primary key,
  user_id text not null,
  couple_id text references couples(id) on delete cascade not null,
  mood_emoji text not null,
  date date not null,
  created_at timestamptz default now() not null,
  unique (user_id, date)
);

create table daily_answers (
  id uuid default gen_random_uuid() primary key,
  couple_id text references couples(id) on delete cascade not null,
  user_id text not null,
  question_index integer not null,
  answer text not null,
  date date not null,
  created_at timestamptz default now() not null,
  unique (user_id, date, question_index)
);

-- ============================================
-- Enable RLS with fully open policies (no auth)
-- ============================================

alter table couples enable row level security;
alter table profiles enable row level security;
alter table events enable row level security;
alter table plans enable row level security;
alter table tasks enable row level security;
alter table wishlist_items enable row level security;
alter table bucket_list enable row level security;
alter table saved_links enable row level security;
alter table cycle_logs enable row level security;
alter table love_notes enable row level security;
alter table journal_entries enable row level security;
alter table moods enable row level security;
alter table daily_answers enable row level security;

-- Open policies — allow anon role full access (no Supabase auth used)
create policy "open" on couples        for all using (true) with check (true);
create policy "open" on profiles       for all using (true) with check (true);
create policy "open" on events         for all using (true) with check (true);
create policy "open" on plans          for all using (true) with check (true);
create policy "open" on tasks          for all using (true) with check (true);
create policy "open" on wishlist_items for all using (true) with check (true);
create policy "open" on bucket_list    for all using (true) with check (true);
create policy "open" on saved_links    for all using (true) with check (true);
create policy "open" on cycle_logs     for all using (true) with check (true);
create policy "open" on love_notes     for all using (true) with check (true);
create policy "open" on journal_entries for all using (true) with check (true);
create policy "open" on moods          for all using (true) with check (true);
create policy "open" on daily_answers  for all using (true) with check (true);

-- ============================================
-- Storage buckets
-- ============================================

insert into storage.buckets (id, name, public)
  values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

insert into storage.buckets (id, name, public)
  values ('uploads', 'uploads', true)
  on conflict (id) do nothing;

create policy "open avatars"  on storage.objects for all using (bucket_id = 'avatars')  with check (bucket_id = 'avatars');
create policy "open uploads"  on storage.objects for all using (bucket_id = 'uploads')  with check (bucket_id = 'uploads');

-- ============================================
-- Seed: insert the couple and two profiles
-- ============================================

insert into couples (id, couple_name, partner1_id, partner2_id)
  values ('couple-us', 'Aziz & Eya', 'user-aziz', 'user-eya')
  on conflict (id) do nothing;

insert into profiles (id, display_name, role, couple_id)
  values
    ('user-aziz', 'Aziz', 'partner1', 'couple-us'),
    ('user-eya',  'Eya',  'partner2', 'couple-us')
  on conflict (id) do nothing;
