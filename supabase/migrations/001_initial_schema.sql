-- ============================================================
-- Soccer Discovery — Supabase Initial Schema
-- Run this in the Supabase SQL Editor (or via supabase db push)
-- ============================================================

-- Enable UUID generation
create extension if not exists "pgcrypto";

-- ----------------------------------------------------------------
-- profiles
-- Mirrors auth.users and stores app-specific user data.
-- A trigger (below) auto-creates a profile on sign-up.
-- ----------------------------------------------------------------
create table if not exists public.profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  field_claimed        boolean default false,
  subscription_plan    text default 'basic',
  subscribed_fields    uuid[] default '{}',
  created_at   timestamptz default now()
);

alter table public.profiles enable row level security;

create policy "Users can read their own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can update their own profile"
  on public.profiles for update
  using (auth.uid() = id);

-- Auto-create profile on new user sign-up
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email)
  values (new.id, new.email);
  return new;
end;
$$;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ----------------------------------------------------------------
-- rental_fields
-- ----------------------------------------------------------------
create table if not exists public.rental_fields (
  id              uuid primary key default gen_random_uuid(),
  facility_name   text not null,
  location        text,
  city            text,
  latitude        double precision,
  longitude       double precision,
  price_per_hour  double precision,
  field_surface   text,
  field_size      text,
  indoor_outdoor  text,
  lights          boolean default false,
  open_hours      text,
  website_url     text,
  phone_number    text,
  image_urls      text[] default '{}',
  availability    jsonb,
  claimed_by      uuid references auth.users(id),
  payment_status  text,
  created_at      timestamptz default now()
);

alter table public.rental_fields enable row level security;

create policy "Anyone can read rental fields"
  on public.rental_fields for select
  using (true);

create policy "Authenticated users can insert rental fields"
  on public.rental_fields for insert
  with check (auth.uid() is not null);

create policy "Owner can update their field"
  on public.rental_fields for update
  using (auth.uid() = claimed_by);

create policy "Owner can delete their field"
  on public.rental_fields for delete
  using (auth.uid() = claimed_by);

-- ----------------------------------------------------------------
-- field_submissions
-- ----------------------------------------------------------------
create table if not exists public.field_submissions (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  facility_name text,
  email         text,
  phone         text,
  location      text,
  approved      boolean default false,
  created_at    timestamptz default now()
);

alter table public.field_submissions enable row level security;

create policy "Anyone can insert a field submission"
  on public.field_submissions for insert
  with check (true);

-- ----------------------------------------------------------------
-- field_claims
-- ----------------------------------------------------------------
create table if not exists public.field_claims (
  id            uuid primary key default gen_random_uuid(),
  name          text,
  email         text,
  facility_name text,
  submitted_at  timestamptz default now()
);

alter table public.field_claims enable row level security;

create policy "Anyone can insert a field claim"
  on public.field_claims for insert
  with check (true);

-- ----------------------------------------------------------------
-- pickup_games
-- ----------------------------------------------------------------
create table if not exists public.pickup_games (
  id               uuid primary key default gen_random_uuid(),
  field_name       text,
  location         text,
  price_per_person double precision,
  players_per_side integer,
  date             text,
  time_slot        text,
  image_urls       text[] default '{}',
  batch_id         uuid,
  created_at       timestamptz default now()
);

alter table public.pickup_games enable row level security;

create policy "Anyone can read pickup games"
  on public.pickup_games for select
  using (true);

create policy "Authenticated users can insert pickup games"
  on public.pickup_games for insert
  with check (auth.uid() is not null);

-- ----------------------------------------------------------------
-- leagues
-- ----------------------------------------------------------------
create table if not exists public.leagues (
  id                    uuid primary key default gen_random_uuid(),
  league_name           text,
  players_per_side      integer,
  price                 double precision,
  gender                text,
  game_days             text[] default '{}',
  location              text,
  latitude              double precision,
  longitude             double precision,
  image_urls            text[] default '{}',
  registration_deadline timestamptz,
  season_start_date     timestamptz,
  created_at            timestamptz default now()
);

alter table public.leagues enable row level security;

create policy "Anyone can read leagues"
  on public.leagues for select
  using (true);

create policy "Authenticated users can insert leagues"
  on public.leagues for insert
  with check (auth.uid() is not null);
