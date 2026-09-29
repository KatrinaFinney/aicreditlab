-- Keep the existing credit_plans row as the active plan for legacy routes.
-- Saved plans belong to one Clerk user; only server-side functions expose writes.
create table if not exists public.saved_credit_plans (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  account_goal text not null check (account_goal in ('personal', 'business')),
  selected_disputes jsonb not null,
  credit_plan text[] not null,
  completed_steps jsonb not null default '[]'::jsonb,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);
create index if not exists saved_credit_plans_user_id_idx on public.saved_credit_plans(user_id);
alter table public.credit_plans add column if not exists active_saved_plan_id uuid references public.saved_credit_plans(id);
alter table public.saved_credit_plans enable row level security;
revoke all on public.saved_credit_plans from anon, authenticated;
grant all on public.saved_credit_plans to service_role;

create or replace function public.save_paid_credit_plan(
  p_user_id text, p_goal text, p_answers jsonb, p_steps text[], p_new boolean
) returns uuid language plpgsql security invoker as $$
declare v_current public.credit_plans%rowtype; v_id uuid; v_completed jsonb;
begin
  select * into v_current from public.credit_plans where user_id = p_user_id for update;
  if not found or v_current.plan_type <> 'paid' then raise exception 'Paid plan required'; end if;
  if p_goal not in ('personal', 'business') then raise exception 'Invalid goal'; end if;

  -- Preserve a pre-existing plan the first time a paid member adds another.
  if v_current.active_saved_plan_id is null and v_current.questionnaire_completed then
    select coalesce(completed_steps, '[]'::jsonb) into v_completed
      from public.credit_plan_progress where user_id = p_user_id;
    insert into public.saved_credit_plans(user_id, account_goal, selected_disputes, credit_plan, completed_steps)
      values (p_user_id, v_current.account_goal, v_current.selected_disputes,
        v_current.credit_plan, coalesce(v_completed, '[]'::jsonb)) returning id into v_id;
    update public.credit_plans set active_saved_plan_id = v_id where user_id = p_user_id;
    v_current.active_saved_plan_id := v_id;
  end if;

  if p_new or v_current.active_saved_plan_id is null then
    insert into public.saved_credit_plans(user_id, account_goal, selected_disputes, credit_plan)
      values (p_user_id, p_goal, p_answers, p_steps) returning id into v_id;
    v_completed := '[]'::jsonb;
  else
    v_id := v_current.active_saved_plan_id;
    select coalesce(completed_steps, '[]'::jsonb) into v_completed
      from public.credit_plan_progress where user_id = p_user_id;
    -- Keep only completed steps still present after editing an assessment.
    select coalesce(jsonb_agg(s), '[]'::jsonb) into v_completed
      from unnest(p_steps) s where exists
        (select 1 from jsonb_array_elements_text(coalesce(v_completed, '[]'::jsonb)) prior where prior.value = s);
    update public.saved_credit_plans set account_goal = p_goal, selected_disputes = p_answers,
      credit_plan = p_steps, completed_steps = v_completed, updated_at = now()
      where id = v_id and user_id = p_user_id;
  end if;
  update public.credit_plans set account_goal = p_goal, selected_disputes = p_answers,
    credit_plan = p_steps, questionnaire_completed = true, active_saved_plan_id = v_id
    where user_id = p_user_id;
  insert into public.credit_plan_progress(user_id, completed_steps) values (p_user_id, v_completed)
    on conflict (user_id) do update set completed_steps = excluded.completed_steps, updated_at = now();
  return v_id;
end $$;

create or replace function public.activate_paid_credit_plan(p_user_id text, p_id uuid)
returns void language plpgsql security invoker as $$
declare v_current public.credit_plans%rowtype; v_target public.saved_credit_plans%rowtype;
begin
  select * into v_current from public.credit_plans where user_id = p_user_id for update;
  if not found or v_current.plan_type <> 'paid' then raise exception 'Paid plan required'; end if;
  select * into v_target from public.saved_credit_plans where id = p_id and user_id = p_user_id;
  if not found then raise exception 'Plan not found'; end if;
  if v_current.active_saved_plan_id = p_id then return; end if;
  if v_current.active_saved_plan_id is not null then
    update public.saved_credit_plans set completed_steps = coalesce(
      (select completed_steps from public.credit_plan_progress where user_id = p_user_id), '[]'::jsonb),
      updated_at = now() where id = v_current.active_saved_plan_id and user_id = p_user_id;
  end if;
  update public.credit_plans set account_goal = v_target.account_goal,
    selected_disputes = v_target.selected_disputes, credit_plan = v_target.credit_plan,
    questionnaire_completed = true, active_saved_plan_id = p_id where user_id = p_user_id;
  insert into public.credit_plan_progress(user_id, completed_steps)
    values (p_user_id, v_target.completed_steps)
    on conflict (user_id) do update set completed_steps = excluded.completed_steps, updated_at = now();
end $$;
revoke all on function public.save_paid_credit_plan(text,text,jsonb,text[],boolean) from public, anon, authenticated;
revoke all on function public.activate_paid_credit_plan(text,uuid) from public, anon, authenticated;
grant execute on function public.save_paid_credit_plan(text,text,jsonb,text[],boolean) to service_role;
grant execute on function public.activate_paid_credit_plan(text,uuid) to service_role;
