-- Base tables for the Clerk-backed server routes. Restore any legacy rows separately;
-- never commit a database backup containing customer information to the repository.
create table if not exists public.credit_plans (
  id uuid primary key default gen_random_uuid(),
  user_id text,
  plan_type text default 'free',
  created_at timestamp without time zone default now(),
  full_name text,
  address text,
  selected_disputes jsonb default '[]'::jsonb,
  creditor_name text,
  account_number text,
  plan text,
  questionnaire_completed boolean default false,
  credit_plan text[] default '{}'::text[]
);

create table if not exists public.disputes (
  id text primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  user_id text,
  creditor text,
  agency text,
  status text,
  updated_at timestamp without time zone,
  letter_content text,
  dispute_details text
);

create table if not exists public.users (
  id text primary key default gen_random_uuid(),
  email text not null unique,
  full_name text,
  created_at timestamp without time zone default now()
);

-- The original disputes table used UUIDs for user IDs. Clerk IDs are text.
drop policy if exists "Allow users to insert disputes matching their user_id" on public.disputes;
drop policy if exists "Allow users to view their disputes" on public.disputes;
alter table public.disputes alter column user_id type text using user_id::text;

-- The plan API upserts on user_id; this index is required for ON CONFLICT.
create unique index if not exists credit_plans_user_id_key on public.credit_plans(user_id);

-- The app uses service-role server routes. No direct browser access is granted.
alter table public.credit_plans enable row level security;
alter table public.disputes enable row level security;
alter table public.users enable row level security;
revoke all on public.credit_plans, public.disputes, public.users from anon, authenticated;
grant all on public.credit_plans, public.disputes, public.users to service_role;
