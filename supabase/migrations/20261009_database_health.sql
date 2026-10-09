-- Read-only database probe: no customer tables and no RLS bypass.
begin;
create function public.creditlab_health_check()
returns boolean
language sql
stable
security invoker
set search_path = ''
as $$ select true $$;
revoke all on function public.creditlab_health_check() from public;
grant execute on function public.creditlab_health_check() to anon, authenticated, service_role;
commit;
