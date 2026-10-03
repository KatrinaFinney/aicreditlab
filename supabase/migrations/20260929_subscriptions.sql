-- Stripe subscription state is written only by authenticated server routes and a signed webhook.
create table if not exists public.billing_subscriptions (
  user_id text primary key,
  stripe_customer_id text not null unique,
  stripe_subscription_id text unique,
  status text not null default 'incomplete',
  updated_at timestamptz not null default now()
);
alter table public.billing_subscriptions enable row level security;
revoke all on public.billing_subscriptions from anon, authenticated;
grant all on public.billing_subscriptions to service_role;

-- Entitlements and billing records change in one database transaction.
create or replace function public.set_subscription_entitlement(
  p_user_id text, p_customer_id text, p_subscription_id text, p_status text
) returns void language plpgsql security invoker as $$
begin
  if p_user_id is null or p_customer_id is null or p_subscription_id is null then
    raise exception 'Missing subscription identity';
  end if;
  insert into public.billing_subscriptions(user_id, stripe_customer_id, stripe_subscription_id, status, updated_at)
    values (p_user_id, p_customer_id, p_subscription_id, p_status, now())
    on conflict (user_id) do update set
      stripe_customer_id = excluded.stripe_customer_id,
      stripe_subscription_id = excluded.stripe_subscription_id,
      status = excluded.status, updated_at = now();
  insert into public.credit_plans(user_id, plan_type)
    values (p_user_id, case when p_status = 'active' then 'paid' else 'free' end)
    on conflict (user_id) do update set plan_type = excluded.plan_type;
end $$;
revoke all on function public.set_subscription_entitlement(text,text,text,text) from public, anon, authenticated;
grant execute on function public.set_subscription_entitlement(text,text,text,text) to service_role;
