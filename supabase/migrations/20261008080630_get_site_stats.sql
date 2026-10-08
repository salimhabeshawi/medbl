create or replace function public.get_site_stats()
returns table (poems_count bigint, poets_count bigint, favorites_count bigint)
language sql
stable
security definer
set search_path = public
as $$
	select
		(select count(*) from public.poems),
		(select count(distinct p.poet_id)
		 from public.poems p
		 where p.poet_id not in (
			 select id from public.poets where name_en = 'Folk poetry'
		 )),
		(select count(*) from public.favorites);
$$;

revoke all on function public.get_site_stats() from public;
grant execute on function public.get_site_stats() to anon, authenticated;
