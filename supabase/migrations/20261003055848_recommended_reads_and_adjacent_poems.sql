begin;

create or replace function public.get_recommended_same_category(
	p_poem_id uuid,
	p_limit int default 3
)
returns setof public.poems
language sql as $$
select p.*
from public.poems p
where p.category_id = (select category_id from public.poems where id = p_poem_id)
	and p.id != p_poem_id
	and p.attribution_status != 'disputed'
	and (select category_id from public.poems where id = p_poem_id) is not null
order by random()
limit p_limit;
$$;

revoke all on function public.get_recommended_same_category(uuid, int) from public;
grant execute on function public.get_recommended_same_category(uuid, int) to anon, authenticated;

create or replace function public.get_recommended_same_poet(
	p_poem_id uuid,
	p_limit int default 3
)
returns setof public.poems
language sql as $$
select p.*
from public.poems p
where p.poet_id = (select poet_id from public.poems where id = p_poem_id)
	and p.id != p_poem_id
	and p.attribution_status != 'disputed'
order by random()
limit p_limit;
$$;

revoke all on function public.get_recommended_same_poet(uuid, int) from public;
grant execute on function public.get_recommended_same_poet(uuid, int) to anon, authenticated;

create or replace function public.get_adjacent_poems(p_poem_id uuid)
returns table (
	prev_id uuid, prev_number int, prev_title text,
	next_id uuid, next_number int, next_title text,
	total_poems int
)
language sql stable as $$
with current_poem as (
	select poem_number from public.poems where id = p_poem_id
),
prev as (
	select id, poem_number, title from public.poems
	where poem_number < (select poem_number from current_poem)
	order by poem_number desc limit 1
),
prev_wrap as (
	select id, poem_number, title from public.poems
	order by poem_number desc limit 1
),
next as (
	select id, poem_number, title from public.poems
	where poem_number > (select poem_number from current_poem)
	order by poem_number asc limit 1
),
next_wrap as (
	select id, poem_number, title from public.poems
	order by poem_number asc limit 1
)
select
	coalesce((select id from prev), (select id from prev_wrap)) as prev_id,
	coalesce((select poem_number from prev), (select poem_number from prev_wrap)) as prev_number,
	coalesce((select title from prev), (select title from prev_wrap)) as prev_title,
	coalesce((select id from next), (select id from next_wrap)) as next_id,
	coalesce((select poem_number from next), (select poem_number from next_wrap)) as next_number,
	coalesce((select title from next), (select title from next_wrap)) as next_title,
	(select count(*) from public.poems)::int as total_poems;
$$;

revoke all on function public.get_adjacent_poems(uuid) from public;
grant execute on function public.get_adjacent_poems(uuid) to anon, authenticated;

commit;
