begin;

alter table public.poem_submissions
	add column published_poem_id uuid references public.poems (id) on delete set null;

create index poem_submissions_published_poem_id_idx
	on public.poem_submissions (published_poem_id);

create or replace function public.approve_poem_submission(
	p_submission_id uuid,
	p_attribution_status public.attribution_status default 'community',
	p_poet_id uuid default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
	v_sub public.poem_submissions;
	v_resolved_poet_id uuid;
	v_poem_id uuid;
begin
	if not public.is_staff() then
		raise exception 'Not authorized: moderator or admin required';
	end if;

	select * into v_sub
	from public.poem_submissions
	where id = p_submission_id;

	if v_sub is null then
		raise exception 'Submission not found';
	end if;
	if v_sub.status <> 'pending' then
		raise exception 'Submission is not pending';
	end if;

	if p_poet_id is not null then
		if not exists (select 1 from public.poets where id = p_poet_id) then
			raise exception 'Poet not found';
		end if;
		v_resolved_poet_id := p_poet_id;
	elsif v_sub.proposed_poet_name_am is not null then
		insert into public.poets (
			name_am, name_en, bio, verified, created_by
		)
		values (
			v_sub.proposed_poet_name_am,
			v_sub.proposed_poet_name_en,
			v_sub.proposed_poet_bio,
			false,
			v_sub.submitted_by
		)
		returning id into v_resolved_poet_id;
	else
		v_resolved_poet_id := v_sub.poet_id;
	end if;

	if v_resolved_poet_id is null then
		raise exception 'No poet could be resolved for this submission';
	end if;

	insert into public.poems (
		poet_id, title, body, category_id, tags, attribution_status, source, submitted_by
	)
	values (
		v_resolved_poet_id, v_sub.title, v_sub.body, v_sub.category_id, v_sub.tags,
		p_attribution_status, v_sub.source, v_sub.submitted_by
	)
	returning id into v_poem_id;

	update public.poem_submissions
	set status = 'approved',
			reviewed_by = auth.uid(),
			published_poem_id = v_poem_id
	where id = p_submission_id;

	return v_poem_id;
end;
$$;

revoke all on function public.approve_poem_submission(uuid, public.attribution_status, uuid) from public;
grant execute on function public.approve_poem_submission(uuid, public.attribution_status, uuid)
	to authenticated, service_role;

create or replace function public.get_poems_page(
	p_sort text default 'date_desc',
	p_limit integer default 12,
	p_offset integer default 0,
	p_query text default null,
	p_category_id uuid default null,
	p_tag text default null
)
returns table (
	id uuid,
	title text,
	body text,
	category_id uuid,
	category_name_am text,
	category_name_en text,
	tags text[],
	attribution_status public.attribution_status,
	poet_id uuid,
	poet_name_am text,
	poet_name_en text,
	poem_number integer,
	view_count integer,
	created_at timestamptz,
	like_count bigint,
	total_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
	with poem_likes as (
		select poem_id, count(*)::bigint as like_count
		from public.favorites
		group by poem_id
	)
	select
		p.id,
		p.title,
		p.body,
		p.category_id,
		c.name_am,
		c.name_en,
		p.tags,
		p.attribution_status,
		p.poet_id,
		po.name_am,
		po.name_en,
		p.poem_number,
		p.view_count,
		p.created_at,
		coalesce(pl.like_count, 0)::bigint,
		count(*) over()::bigint
	from public.poems p
	join public.poets po on po.id = p.poet_id
	left join public.categories c on c.id = p.category_id
	left join poem_likes pl on pl.poem_id = p.id
	where (p_category_id is null or p.category_id = p_category_id)
		and (p_tag is null or p.tags @> array[p_tag]::text[])
		and (
			p_query is null
			or btrim(p_query) = ''
			or p.title ilike '%' || btrim(p_query) || '%'
			or p.body ilike '%' || btrim(p_query) || '%'
			or coalesce(array_to_string(p.tags, ' '), '') ilike '%' || btrim(p_query) || '%'
			or po.name_am ilike '%' || btrim(p_query) || '%'
			or coalesce(po.name_en, '') ilike '%' || btrim(p_query) || '%'
			or coalesce(c.name_am, '') ilike '%' || btrim(p_query) || '%'
			or coalesce(c.name_en, '') ilike '%' || btrim(p_query) || '%'
		)
	order by
		case when p_sort = 'date_asc' then p.created_at end asc,
		case when p_sort in ('date_desc', '') then p.created_at end desc,
		case when p_sort = 'alphabetical' then lower(p.title) end asc,
		case when p_sort = 'likes_desc' then coalesce(pl.like_count, 0) end desc,
		case when p_sort = 'likes_asc' then coalesce(pl.like_count, 0) end asc,
		p.created_at desc,
		p.id
	limit greatest(1, least(coalesce(p_limit, 12), 100))
	offset greatest(coalesce(p_offset, 0), 0);
$$;

revoke all on function public.get_poems_page(text, integer, integer, text, uuid, text) from public;
grant execute on function public.get_poems_page(text, integer, integer, text, uuid, text)
	to anon, authenticated, service_role;

create or replace function public.list_poets(
	p_sort text default 'name',
	p_query text default null
)
returns table (
	id uuid,
	name_am text,
	name_en text,
	verified boolean,
	poems_count bigint,
	likes_count bigint,
	avg_likes_per_poem numeric
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
	)
	select
		id,
		name_am,
		name_en,
		verified,
		poems_count,
		likes_count,
		avg_likes_per_poem
	from with_average
	order by
		case when p_sort = 'poems_desc' then poems_count end desc,
		case when p_sort = 'poems_asc' then poems_count end asc,
		case when p_sort = 'likes_desc' then likes_count end desc,
		case when p_sort = 'likes_asc' then likes_count end asc,
		case when p_sort = 'avg_likes_desc' then avg_likes_per_poem end desc nulls last,
		case when p_sort = 'avg_likes_asc' then avg_likes_per_poem end asc nulls last,
		name_am,
		id;
$$;

revoke all on function public.list_poets(text, text) from public;
grant execute on function public.list_poets(text, text) to anon, authenticated, service_role;

commit;
