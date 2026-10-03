begin;

drop function if exists public.list_poets(text, text);

create or replace function public.list_poets(
	p_sort text default 'name',
	p_query text default null,
	p_limit integer default 12,
	p_offset integer default 0
)
returns table (
	id uuid,
	name_am text,
	name_en text,
	verified boolean,
	poems_count bigint,
	likes_count bigint,
	avg_likes_per_poem numeric,
	total_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
	with poem_likes as (
		select poem_id, count(*)::bigint as likes_count
		from public.favorites
		group by poem_id
	), poet_stats as (
		select
			po.id,
			po.name_am,
			po.name_en,
			po.verified,
			count(p.id)::bigint as poems_count,
			coalesce(sum(coalesce(pl.likes_count, 0)), 0)::bigint as likes_count
		from public.poets po
		left join public.poems p on p.poet_id = po.id
		left join poem_likes pl on pl.poem_id = p.id
		where (
			p_query is null
			or btrim(p_query) = ''
			or po.name_am ilike '%' || btrim(p_query) || '%'
			or coalesce(po.name_en, '') ilike '%' || btrim(p_query) || '%'
		)
		group by po.id, po.name_am, po.name_en, po.verified
	), with_average as (
		select
			poet_stats.*,
			case when poems_count >= 2
				then round(likes_count::numeric / poems_count::numeric, 1)
			end as avg_likes_per_poem
		from poet_stats
	), ordered as (
		select
			id,
			name_am,
			name_en,
			verified,
			poems_count,
			likes_count,
			avg_likes_per_poem,
			count(*) over()::bigint as total_count
		from with_average
		order by
			case when p_sort = 'poems_desc' then poems_count end desc,
			case when p_sort = 'poems_asc' then poems_count end asc,
			case when p_sort = 'likes_desc' then likes_count end desc,
			case when p_sort = 'likes_asc' then likes_count end asc,
			case when p_sort = 'avg_likes_desc' then avg_likes_per_poem end desc nulls last,
			case when p_sort = 'avg_likes_asc' then avg_likes_per_poem end asc nulls last,
			name_am,
			id
	)
	select *
	from ordered
	limit greatest(1, least(coalesce(p_limit, 12), 100))
	offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.list_poets(text, text, integer, integer) from public;
grant execute on function public.list_poets(text, text, integer, integer)
	to anon, authenticated, service_role;

commit;
