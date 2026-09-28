-- Stripe is the source of truth for subscription access. Run after account_goal.
create table if not exists public.billing_accounts (
  user_id text primary key,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  subscription_status text,
  last_event_created bigint not null default 0,
  updated_at timestamptz not null default now()
);
alter table public.billing_accounts enable row level security;
revoke all on public.billing_accounts from public, anon, authenticated;

-- Apply a verified Stripe event and entitlement in the same transaction.
create or replace function public.sync_billing_subscription(
  p_customer_id text, p_subscription_id text, p_status text, p_event_created bigint
) returns void language plpgsql security definer set search_path = public as $$
declare v_account public.billing_accounts%rowtype;
begin
  select * into v_account from public.billing_accounts
    where stripe_customer_id = p_customer_id for update;
  if not found then raise exception 'Unknown billing customer'; end if;
  if p_subscription_id is null or p_status not in
    ('active', 'trialing', 'incomplete', 'incomplete_expired', 'past_due', 'unpaid', 'paused', 'canceled')
    or p_event_created is null then raise exception 'Invalid subscription event'; end if;
  if p_event_created < v_account.last_event_created then return; end if;
  -- A delayed event from an older subscription must not revoke a newer one.
  if v_account.stripe_subscription_id is distinct from p_subscription_id
    and v_account.stripe_subscription_id is not null
    and p_status not in ('active', 'trialing') then return; end if;
  update public.billing_accounts set stripe_subscription_id = p_subscription_id,
    subscription_status = p_status, last_event_created = p_event_created,
    updated_at = now() where user_id = v_account.user_id;
  update public.credit_plans set plan_type = case when p_status in ('active', 'trialing')
    then 'paid' else 'free' end where user_id = v_account.user_id;
end; $$;

revoke all on function public.sync_billing_subscription(text,text,text,bigint) from public, anon, authenticated;
grant execute on function public.sync_billing_subscription(text,text,text,bigint) to service_role;
