-- Drop existing tables if they exist (in dependency order)
drop table if exists daily_answers;
drop table if exists moods;
drop table if exists journal_entries;
drop table if exists love_notes;
drop table if exists cycle_logs;
drop table if exists saved_links;
drop table if exists bucket_list;
drop table if exists wishlist_items;
drop table if exists plans;
drop table if exists tasks;
drop table if exists events;
drop table if exists couple_invites;
drop table if exists profiles;
drop table if exists couples;

-- 1. Couples Table
create table couples (
  id uuid default gen_random_uuid() primary key,
  couple_name text,
  cover_photo_url text,
  anniversary_date date,
  partner1_id uuid,
  partner2_id uuid,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 2. Profiles Table (extends auth.users)
create table profiles (
  id uuid references auth.users on delete cascade primary key,
  display_name text,
  avatar_url text,
  role text,
  couple_id uuid references couples(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 3. Couple Invites Table
create table couple_invites (
  id uuid default gen_random_uuid() primary key,
  code text unique not null,
  couple_id uuid references couples(id) on delete cascade not null,
  used boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 4. Events Table
create table events (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  created_by uuid references profiles(id) on delete cascade not null,
  title text not null,
  date date not null,
  time text,
  location text,
  category text default 'important',
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 5. Plans Table
create table plans (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  created_by uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  status text default 'dream',
  priority_order integer default 0,
  linked_wishlist_id uuid,
  image_url text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 6. Tasks Table
create table tasks (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  created_by uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  due_date date,
  assigned_to text default 'both',
  priority text default 'medium',
  is_done boolean default false,
  is_private boolean default false,
  repeat_rule text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 7. Wishlist Items Table
create table wishlist_items (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  owner_id uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  link text,
  image_url text,
  price_range text,
  priority integer default 1,
  category text default 'occasion',
  claimed_by uuid references profiles(id) on delete set null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 8. Bucket List Table
create table bucket_list (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  created_by uuid references profiles(id) on delete cascade not null,
  title text not null,
  description text,
  link text,
  image_url text,
  status text default 'dream',
  completed_at timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 9. Saved Links Table
create table saved_links (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  saved_by uuid references profiles(id) on delete cascade not null,
  url text not null,
  title text,
  thumbnail_url text,
  note text,
  category text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 10. Cycle Logs Table
create table cycle_logs (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  period_start date not null,
  period_end date,
  symptoms text,
  mood text,
  notes text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 11. Love Notes Table
create table love_notes (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  from_id uuid references profiles(id) on delete cascade not null,
  to_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  image_url text,
  mood text,
  is_read boolean default false,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 12. Journal Entries Table
create table journal_entries (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  author_id uuid references profiles(id) on delete cascade not null,
  text text not null,
  image_url text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- 13. Moods Table
create table moods (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references profiles(id) on delete cascade not null,
  couple_id uuid references couples(id) on delete cascade not null,
  mood_emoji text not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, date)
);

-- 14. Daily Answers Table
create table daily_answers (
  id uuid default gen_random_uuid() primary key,
  couple_id uuid references couples(id) on delete cascade not null,
  user_id uuid references profiles(id) on delete cascade not null,
  question_index integer not null,
  answer text not null,
  date date not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique (user_id, date, question_index)
);

-- ============================================
-- Enable Row Level Security on all tables
-- ============================================

alter table couples enable row level security;
alter table profiles enable row level security;
alter table couple_invites enable row level security;
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

-- ============================================
-- RLS Policies — allow all authenticated users
-- (In production you would scope these to couple_id)
-- ============================================

create policy "Authenticated users can do everything" on couples for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on profiles for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on couple_invites for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on events for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on plans for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on tasks for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on wishlist_items for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on bucket_list for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on saved_links for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on cycle_logs for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on love_notes for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on journal_entries for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on moods for all using (auth.role() = 'authenticated');
create policy "Authenticated users can do everything" on daily_answers for all using (auth.role() = 'authenticated');

-- ============================================
-- Storage Buckets
-- ============================================

-- Avatars bucket
insert into storage.buckets (id, name, public) values ('avatars', 'avatars', true)
  on conflict (id) do nothing;

create policy "Avatar images are publicly accessible" on storage.objects
  for select using (bucket_id = 'avatars');

create policy "Authenticated users can upload avatars" on storage.objects
  for insert with check (bucket_id = 'avatars' and auth.role() = 'authenticated');

create policy "Authenticated users can update avatars" on storage.objects
  for update using (bucket_id = 'avatars' and auth.role() = 'authenticated');

-- Uploads bucket (for note images, wishlist images, etc.)
insert into storage.buckets (id, name, public) values ('uploads', 'uploads', true)
  on conflict (id) do nothing;

create policy "Uploads are publicly accessible" on storage.objects
  for select using (bucket_id = 'uploads');

create policy "Authenticated users can upload files" on storage.objects
  for insert with check (bucket_id = 'uploads' and auth.role() = 'authenticated');

create policy "Authenticated users can update uploads" on storage.objects
  for update using (bucket_id = 'uploads' and auth.role() = 'authenticated');

create policy "Authenticated users can delete uploads" on storage.objects
  for delete using (bucket_id = 'uploads' and auth.role() = 'authenticated');

-- ============================================
-- Trigger: Auto-create profile on user signup
-- ============================================

create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id);
  return new;
end;
$$ language plpgsql security definer;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
