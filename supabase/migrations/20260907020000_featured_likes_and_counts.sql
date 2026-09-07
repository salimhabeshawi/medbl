begin;

-- Public aggregate reads used by cards and featured sections. Individual
-- favorite rows remain protected by RLS; only counts are exposed.
create or replace function public.get_poem_favorite_counts(p_poem_ids uuid[])
returns table (poem_id uuid, favorite_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, count(f.id)::bigint
  from unnest(p_poem_ids) as requested(id)
  join public.poems p on p.id = requested.id
  left join public.favorites f on f.poem_id = p.id
  group by p.id;
$$;

create or replace function public.get_featured_poems(p_limit integer default 5)
returns table (
  id uuid,
  title text,
  body text,
  category text,
  tags text[],
  attribution_status public.attribution_status,
  poet_id uuid,
  poet_name_am text,
  poet_name_en text,
  favorite_count bigint
)
language sql
stable
security definer
set search_path = public
as $$
  select
    p.id,
    p.title,
    p.body,
    p.category,
    p.tags,
    p.attribution_status,
    p.poet_id,
    po.name_am,
    po.name_en,
    count(f.id)::bigint
  from public.poems p
  join public.poets po on po.id = p.poet_id
  left join public.favorites f on f.poem_id = p.id
  where p.attribution_status <> 'disputed'
  group by p.id, p.title, p.body, p.category, p.tags,
           p.attribution_status, p.poet_id, po.name_am, po.name_en
  order by count(f.id) desc, p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 5), 25));
$$;

revoke all on function public.get_poem_favorite_counts(uuid[]) from public;
revoke all on function public.get_featured_poems(integer) from public;
grant execute on function public.get_poem_favorite_counts(uuid[]) to anon, authenticated, service_role;
grant execute on function public.get_featured_poems(integer) to anon, authenticated, service_role;

-- Return the poet's per-poem signal as a percentage of the strongest poet's
-- signal, so the displayed value is always between 0% and 100%.
drop function if exists public.get_featured_poets(integer);
create or replace function public.get_featured_poets(p_limit integer default 5)
returns table (
  id uuid,
  name_am text,
  name_en text,
  poem_count bigint,
  favorite_count bigint,
  favorites_per_poem numeric,
  favorites_per_poem_percent numeric,
  featured_score numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with poet_stats as (
    select po.id, po.name_am, po.name_en,
           count(distinct p.id)::bigint as poem_count,
           count(f.id)::bigint as favorite_count,
           count(f.id)::numeric / nullif(count(distinct p.id), 0) as favorites_per_poem
    from public.poets po
    join public.poems p on p.poet_id = po.id and p.attribution_status <> 'disputed'
    left join public.favorites f on f.poem_id = p.id
    group by po.id, po.name_am, po.name_en
  ),
  scored as (
    select stats.*,
      coalesce(100 * stats.favorites_per_poem / nullif(max(stats.favorites_per_poem) over (), 0), 0) as favorites_per_poem_percent,
      coalesce(0.5 * stats.poem_count::numeric / nullif(max(stats.poem_count) over (), 0), 0)
      + coalesce(0.5 * stats.favorites_per_poem / nullif(max(stats.favorites_per_poem) over (), 0), 0) as featured_score
    from poet_stats stats
  )
  select id, name_am, name_en, poem_count, favorite_count,
         round(favorites_per_poem, 2), round(favorites_per_poem_percent, 2),
         round(featured_score, 4)
  from scored
  order by featured_score desc, poem_count desc, name_am
  limit greatest(1, least(coalesce(p_limit, 5), 25));
$$;

revoke all on function public.get_featured_poets(integer) from public;
grant execute on function public.get_featured_poets(integer) to anon, authenticated, service_role;

commit;
