-- Forward-only hardening of the existing subscription store. No second billing table.
create or replace function public.set_subscription_entitlement(
  p_user_id text, p_customer_id text, p_subscription_id text, p_status text
) returns void language plpgsql security invoker as $$
declare v_user_id text;
begin
  if p_user_id is null or p_customer_id is null or p_subscription_id is null or p_status is null
    or p_status not in ('active','trialing','incomplete','incomplete_expired','past_due','unpaid','paused','canceled') then
    raise exception 'Invalid subscription identity or status';
  end if;
  select user_id into v_user_id from public.billing_subscriptions
    where user_id = p_user_id and stripe_customer_id = p_customer_id for update;
  if not found then raise exception 'Unknown billing customer'; end if;
  update public.billing_subscriptions set stripe_subscription_id = p_subscription_id,
    status = p_status, updated_at = now() where user_id = v_user_id;
  -- An assessment must exist before checkout. Never create an incomplete plan via billing.
  update public.credit_plans set plan_type = case when p_status = 'active' then 'paid' else 'free' end
    where user_id = v_user_id;
  if not found then raise exception 'Missing credit assessment'; end if;
end $$;
revoke all on public.billing_subscriptions from public, anon, authenticated;
grant all on public.billing_subscriptions to service_role;
revoke all on function public.set_subscription_entitlement(text,text,text,text) from public, anon, authenticated;
grant execute on function public.set_subscription_entitlement(text,text,text,text) to service_role;
