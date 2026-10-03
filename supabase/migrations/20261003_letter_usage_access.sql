-- The server reads monthly counts directly; writes stay behind quota RPCs.
grant select on public.letter_usage to service_role;
