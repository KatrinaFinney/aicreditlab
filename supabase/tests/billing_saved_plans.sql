-- Run after all migrations in an isolated database. Always rolls back fixtures.
begin;
insert into public.credit_plans(user_id,account_goal,questionnaire_completed,selected_disputes,credit_plan)
  values ('qa_billing_a','personal',true,'{"1":["Collections"]}',array['Review personal report']),
         ('qa_billing_b','business',true,'{}',array['Review business setup']);
insert into public.billing_subscriptions(user_id,stripe_customer_id)
  values ('qa_billing_a','cus_qa_a'), ('qa_billing_missing_plan','cus_qa_missing');
set local role service_role;
do $$
declare v_business uuid; v_personal uuid; v_count integer;
begin
  perform public.set_subscription_entitlement('qa_billing_a','cus_qa_a','sub_qa','active');
  if (select plan_type from public.credit_plans where user_id='qa_billing_a') <> 'paid' then raise exception 'Active entitlement failed'; end if;
  if (select plan_type from public.credit_plans where user_id='qa_billing_b') <> 'free' then raise exception 'Cross-account entitlement'; end if;
  v_business := public.save_paid_credit_plan('qa_billing_a','business','{}',array['Review business setup'],true);
  select id into v_personal from public.saved_credit_plans where user_id='qa_billing_a' and account_goal='personal';
  if v_personal is null then raise exception 'Existing personal plan was not preserved'; end if;
  update public.credit_plan_progress set completed_steps='["Review business setup"]' where user_id='qa_billing_a';
  perform public.activate_paid_credit_plan('qa_billing_a',v_personal);
  if (select account_goal from public.credit_plans where user_id='qa_billing_a') <> 'personal' then raise exception 'Personal switch failed'; end if;
  perform public.activate_paid_credit_plan('qa_billing_a',v_business);
  if (select completed_steps from public.credit_plan_progress where user_id='qa_billing_a') <> '["Review business setup"]'::jsonb then raise exception 'Saved progress lost'; end if;
  begin
    perform public.activate_paid_credit_plan('qa_billing_b',v_business);
    raise exception 'Expected ownership denial';
  exception when others then
    if sqlerrm='Expected ownership denial' then raise; end if;
  end;
  perform public.set_subscription_entitlement('qa_billing_a','cus_qa_a','sub_qa','trialing');
  if (select plan_type from public.credit_plans where user_id='qa_billing_a') <> 'free' then raise exception 'Trial incorrectly granted access'; end if;
  begin
    perform public.save_paid_credit_plan('qa_billing_a','personal','{}',array['Extra'],true);
    raise exception 'Expected paid-plan denial';
  exception when others then
    if sqlerrm='Expected paid-plan denial' then raise; end if;
  end;
  perform public.set_subscription_entitlement('qa_billing_a','cus_qa_a','sub_qa','canceled');
  select count(*) into v_count from public.saved_credit_plans where user_id='qa_billing_a';
  if v_count <> 2 then raise exception 'Downgrade removed saved records'; end if;
  begin
    perform public.set_subscription_entitlement('qa_billing_b','cus_qa_a','sub_qa','active');
    raise exception 'Expected customer ownership denial';
  exception when others then
    if sqlerrm='Expected customer ownership denial' then raise; end if;
  end;
  begin
    perform public.set_subscription_entitlement('qa_billing_a','cus_qa_a','sub_qa','bogus');
    raise exception 'Expected invalid-status denial';
  exception when others then
    if sqlerrm='Expected invalid-status denial' then raise; end if;
  end;
  begin
    perform public.set_subscription_entitlement('qa_billing_missing_plan','cus_qa_missing','sub_missing','active');
    raise exception 'Expected missing-assessment denial';
  exception when others then
    if sqlerrm='Expected missing-assessment denial' then raise; end if;
  end;
  if (select status from public.billing_subscriptions where user_id='qa_billing_missing_plan') <> 'incomplete' then raise exception 'Failed entitlement was not atomic'; end if;
  if exists(select 1 from public.credit_plans where user_id='qa_billing_missing_plan') then raise exception 'Billing created an incomplete assessment'; end if;
end $$;
rollback;
