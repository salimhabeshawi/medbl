begin;

drop function if exists public.get_featured_poets(integer);

create or replace function public.get_featured_poets(p_limit integer default 5)
returns table (
  id uuid,
  name_am text,
  name_en text,
  poem_count bigint,
  liked_poem_count bigint,
  favorite_count bigint,
  favorites_per_poem numeric,
  favorites_per_poem_percent numeric,
  featured_score numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
begin
return query
with poet_stats as (
  select
    po.id,
    po.name_am,
    po.name_en,
    count(distinct p.id)::bigint                                              as poem_count,
    count(distinct case when f.id is not null then p.id end)::bigint          as liked_poem_count,
    count(f.id)::bigint                                                       as favorite_count,
    count(f.id)::numeric / nullif(count(distinct p.id), 0)                   as favorites_per_poem
  from public.poets         po
  join   public.poems       p  on p.poet_id = po.id
                               and p.attribution_status <> 'disputed'
  left join public.favorites f  on f.poem_id = p.id
  group by po.id, po.name_am, po.name_en
)
select
  poet_stats.id,
  poet_stats.name_am,
  poet_stats.name_en,
  poet_stats.poem_count,
  poet_stats.liked_poem_count,
  poet_stats.favorite_count,
  round(coalesce(poet_stats.favorites_per_poem, 0)::numeric, 2)                        as favorites_per_poem,
  round(
    case
      when max(poet_stats.favorite_count) over () = 0 then 0::numeric
      else 100.0
           * ln(1 + poet_stats.favorite_count::numeric)
           / nullif(ln(1 + max(poet_stats.favorite_count) over ())::numeric, 0)
    end::numeric,
    1
  )                                                                            as favorites_per_poem_percent,
  round(
    coalesce(
      0.4::numeric * ln(1 + poet_stats.poem_count::numeric)
          / nullif(ln(1 + max(poet_stats.poem_count) over ())::numeric, 0),
      0
    )
    + coalesce(
      0.6::numeric * ln(1 + poet_stats.favorite_count::numeric)
          / nullif(ln(1 + max(poet_stats.favorite_count) over ())::numeric, 0),
      0
    ),
    4
  )                                                                            as featured_score
from poet_stats
order by featured_score desc, poet_stats.poem_count desc, poet_stats.name_am
limit greatest(1, least(coalesce(p_limit, 5), 25));
end;
$$;

revoke all   on function public.get_featured_poets(integer) from public;
grant execute on function public.get_featured_poets(integer)
  to anon, authenticated, service_role;

commit;