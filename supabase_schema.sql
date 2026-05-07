-- GrowWell Marketing — Supabase Schema v2
-- Run this in your Supabase project → SQL Editor → New Query → Run

-- ── Markets ──────────────────────────────────────────────────────────────────
create table if not exists markets (
  id text primary key,
  name text not null,
  created_at timestamptz default now()
);

-- ── Team Members ──────────────────────────────────────────────────────────────
create table if not exists team_members (
  id text primary key,
  name text not null,
  email text,
  role text check (role in ('director','videographer','editor','salesman')) not null,
  avatar_initials text,
  color text,
  market_id text,
  pin text not null default '0000',
  is_owner boolean default false,
  created_at timestamptz default now()
);

-- ── Clients ───────────────────────────────────────────────────────────────────
create table if not exists clients (
  id text primary key,
  business_name text not null,
  contact_name text not null,
  email text,
  phone text,
  industry text,
  package text check (package in ('silver','gold','custom')) default 'silver',
  pipeline_stage text check (pipeline_stage in ('lead','proposal_sent','negotiating','active','paused','inactive')) default 'lead',
  monthly_rate numeric default 0,
  notes text,
  platforms text[] default '{}',
  start_date date,
  market_id text,
  created_at timestamptz default now()
);

-- ── Projects ──────────────────────────────────────────────────────────────────
create table if not exists projects (
  id text primary key,
  client_id text references clients(id) on delete cascade,
  client_name text,
  title text not null,
  description text,
  status text check (status in ('not_started','in_production','in_editing','review','approved','delivered')) default 'not_started',
  due_date date not null,
  shoot_date date,
  assigned_videographer text,
  assigned_editor text,
  platforms text[] default '{}',
  script_ready boolean default false,
  footage_uploaded boolean default false,
  notes text,
  market_id text,
  created_at timestamptz default now()
);

-- ── Drive Files (File Hub) ─────────────────────────────────────────────────────
create table if not exists drive_files (
  id text primary key,
  project_id text,
  client_id text,
  client_name text,
  project_title text,
  drive_link text not null,
  label text not null,
  type text check (type in ('raw_footage','b_roll','photos','final_edit','audio','other')) default 'other',
  uploaded_by text,
  notes text,
  market_id text,
  created_at timestamptz default now()
);

-- ── Scheduled Posts (Social Scheduler) ────────────────────────────────────────
create table if not exists scheduled_posts (
  id text primary key,
  client_id text,
  client_name text,
  platform text check (platform in ('instagram','facebook','tiktok','youtube')) not null,
  caption text,
  drive_link text,
  scheduled_at timestamptz not null,
  status text check (status in ('draft','scheduled','published')) default 'scheduled',
  notes text,
  market_id text,
  created_at timestamptz default now()
);

-- ── Row Level Security ────────────────────────────────────────────────────────
-- We handle auth in-app with PINs, so all rows are accessible via the anon key.
-- Tighten these policies if you later add Supabase Auth.

alter table markets enable row level security;
alter table team_members enable row level security;
alter table clients enable row level security;
alter table projects enable row level security;
alter table drive_files enable row level security;
alter table scheduled_posts enable row level security;

create policy "public_all" on markets for all using (true) with check (true);
create policy "public_all" on team_members for all using (true) with check (true);
create policy "public_all" on clients for all using (true) with check (true);
create policy "public_all" on projects for all using (true) with check (true);
create policy "public_all" on drive_files for all using (true) with check (true);
create policy "public_all" on scheduled_posts for all using (true) with check (true);
