-- Existing saved plans are personal plans. Account goal describes the current assessment.
alter table public.credit_plans
  add column if not exists account_goal text not null default 'personal'
  check (account_goal in ('personal', 'business'));
