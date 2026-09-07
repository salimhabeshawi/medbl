begin;

-- Featured poets are ranked by two equally weighted, normalized signals:
-- 1. published poem count
-- 2. favorites per published poem
-- Disputed poems do not contribute to the public ranking.
create or replace function public.get_featured_poets(p_limit integer default 5)
returns table (
  id uuid,
  name_am text,
  name_en text,
  poem_count bigint,
  favorite_count bigint,
  favorites_per_poem numeric,
  featured_score numeric
)
language sql
stable
security invoker
set search_path = public
as $$
  with poet_stats as (
    select
      po.id,
      po.name_am,
      po.name_en,
      count(distinct p.id)::bigint as poem_count,
      count(f.id)::bigint as favorite_count,
      count(f.id)::numeric / nullif(count(distinct p.id), 0) as favorites_per_poem
    from public.poets po
    join public.poems p
      on p.poet_id = po.id
     and p.attribution_status <> 'disputed'
    left join public.favorites f on f.poem_id = p.id
    group by po.id, po.name_am, po.name_en
  ),
  scored as (
    select
      stats.*,
      (
        coalesce(0.5 * stats.poem_count::numeric / nullif(max(stats.poem_count) over (), 0), 0)
        + coalesce(0.5 * stats.favorites_per_poem / nullif(max(stats.favorites_per_poem) over (), 0), 0)
      ) as featured_score
    from poet_stats stats
  )
  select
    scored.id,
    scored.name_am,
    scored.name_en,
    scored.poem_count,
    scored.favorite_count,
    round(scored.favorites_per_poem, 2),
    round(scored.featured_score, 4)
  from scored
  order by scored.featured_score desc, scored.poem_count desc, scored.name_am
  limit greatest(1, least(coalesce(p_limit, 5), 25));
$$;

revoke all on function public.get_featured_poets(integer) from public;
grant execute on function public.get_featured_poets(integer) to anon, authenticated, service_role;

commit;
