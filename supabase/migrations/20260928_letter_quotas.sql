-- Monthly quotas use UTC calendar months. Review before applying to production.
create table if not exists public.letter_usage (
  id uuid primary key default gen_random_uuid(),
  user_id text not null,
  kind text not null check (kind in ('free_download', 'paid_generation')),
  period_start date not null,
  status text not null check (status in ('reserved', 'complete')),
  created_at timestamptz not null default now()
);
create index if not exists letter_usage_monthly_idx on public.letter_usage(user_id, kind, period_start, status);
alter table public.letter_usage enable row level security;

create or replace function public.reserve_letter_slot(p_user_id text, p_kind text, p_limit integer)
returns uuid language plpgsql security definer set search_path = public as $$
declare v_period date := date_trunc('month', now() at time zone 'UTC')::date;
declare v_count integer;
declare v_id uuid;
begin
  if p_user_id is null or p_kind not in ('free_download', 'paid_generation') or
     (p_kind = 'free_download' and p_limit <> 3) or
     (p_kind = 'paid_generation' and p_limit <> 5) then
    raise exception 'Invalid quota request';
  end if;
  perform pg_advisory_xact_lock(hashtext(p_user_id), hashtext(p_kind || v_period::text));
  delete from public.letter_usage where user_id = p_user_id and kind = p_kind and
    period_start = v_period and status = 'reserved' and created_at < now() - interval '10 minutes';
  select count(*) into v_count from public.letter_usage where user_id = p_user_id and
    kind = p_kind and period_start = v_period and status in ('reserved', 'complete');
  if v_count >= p_limit then return null; end if;
  insert into public.letter_usage(user_id, kind, period_start, status)
    values(p_user_id, p_kind, v_period, 'reserved') returning id into v_id;
  return v_id;
end; $$;

create or replace function public.complete_letter_slot(p_user_id text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  update public.letter_usage set status = 'complete' where id = p_id and user_id = p_user_id and status = 'reserved';
end; $$;

create or replace function public.release_letter_slot(p_user_id text, p_id uuid)
returns void language plpgsql security definer set search_path = public as $$
begin
  delete from public.letter_usage where id = p_id and user_id = p_user_id and status = 'reserved';
end; $$;

revoke all on public.letter_usage from public, anon, authenticated;
revoke all on function public.reserve_letter_slot(text,text,integer) from public, anon, authenticated;
revoke all on function public.complete_letter_slot(text,uuid) from public, anon, authenticated;
revoke all on function public.release_letter_slot(text,uuid) from public, anon, authenticated;
grant execute on function public.reserve_letter_slot(text,text,integer) to service_role;
grant execute on function public.complete_letter_slot(text,uuid) to service_role;
grant execute on function public.release_letter_slot(text,uuid) to service_role;
