-- Apply after 20260928_00_baseline.sql.
create table if not exists public.credit_plan_progress (
  user_id text primary key,
  completed_steps jsonb not null default '[]'::jsonb,
  focus_mode boolean not null default false,
  session_minutes integer not null default 10 check (session_minutes in (5, 10, 20)),
  updated_at timestamptz not null default now()
);

-- Safe if the table was created by an earlier version of this migration.
alter table public.credit_plan_progress add column if not exists focus_mode boolean not null default false;
alter table public.credit_plan_progress add column if not exists session_minutes integer not null default 10;

alter table public.credit_plan_progress enable row level security;
-- The application accesses this table only through Clerk-authenticated server routes.
-- No anon or authenticated browser policy is granted here.
revoke all on public.credit_plan_progress from anon, authenticated;
grant all on public.credit_plan_progress to service_role;
