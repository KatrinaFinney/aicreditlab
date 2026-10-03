-- Run after all migrations in an isolated database. Fixtures always roll back.
begin;
set local role service_role;
do $$
declare v_id uuid; v_count integer; v_index integer;
begin
  if not has_table_privilege('service_role', 'public.letter_usage', 'SELECT') then
    raise exception 'Server cannot read letter allowance';
  end if;
  if has_table_privilege('anon', 'public.letter_usage', 'SELECT') or
     has_table_privilege('authenticated', 'public.letter_usage', 'SELECT') then
    raise exception 'Letter usage exposed to browser roles';
  end if;
  for v_index in 1..3 loop
    v_id := public.reserve_letter_slot('qa_quota_personal_a', 'free_download', 3);
    if v_id is null then raise exception 'Free download denied early'; end if;
    perform public.complete_letter_slot('qa_quota_personal_b', v_id);
    if exists(select 1 from public.letter_usage where id=v_id and status='complete') then
      raise exception 'Cross-account completion';
    end if;
    perform public.release_letter_slot('qa_quota_personal_b', v_id);
    if not exists(select 1 from public.letter_usage where id=v_id) then
      raise exception 'Cross-account deletion';
    end if;
    perform public.complete_letter_slot('qa_quota_personal_a', v_id);
  end loop;
  if public.reserve_letter_slot('qa_quota_personal_a', 'free_download', 3) is not null then
    raise exception 'Fourth free download allowed';
  end if;
  select count(*) into v_count from public.letter_usage where user_id='qa_quota_personal_a'
    and kind='free_download' and status='complete'
    and period_start=date_trunc('month', now() at time zone 'UTC')::date;
  if v_count <> 3 then raise exception 'Usage count incorrect'; end if;
  v_id := public.reserve_letter_slot('qa_quota_personal_b', 'free_download', 3);
  if v_id is null then raise exception 'Another account inherited the cap'; end if;
  perform public.release_letter_slot('qa_quota_personal_b', v_id);
  if exists(select 1 from public.letter_usage where user_id='qa_quota_personal_b') then
    raise exception 'Failed download consumed allowance';
  end if;
end $$;
rollback;
