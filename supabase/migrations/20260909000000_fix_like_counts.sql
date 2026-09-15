begin;

-- ── Fix 1: get_poem_favorite_counts ─────────────────────────────────────────
-- The old version used `unnest(p_poem_ids)` directly in the FROM clause.
-- When the same poem id appears more than once in the input array (e.g. the
-- home page passes ids from both the "recent" and "featured" sections, which
-- can overlap), each duplicate multiplied the favourite count for that poem.
-- The fix is to deduplicate the input ids before joining.
create or replace function public.get_poem_favorite_counts(p_poem_ids uuid[])
returns table (poem_id uuid, favorite_count bigint)
language sql
stable
security definer
set search_path = public
as $$
  select p.id, count(f.id)::bigint
  from (select distinct unnest(p_poem_ids)) as requested(id)
  join   public.poems     p on p.id          = requested.id
  left join public.favorites f on f.poem_id  = p.id
  group by p.id;
$$;

revoke all   on function public.get_poem_favorite_counts(uuid[]) from public;
grant execute on function public.get_poem_favorite_counts(uuid[])
  to anon, authenticated, service_role;


-- ── Fix 2: get_featured_poets ────────────────────────────────────────────────
-- The old formula for favorites_per_poem_percent normalised linearly against
-- the maximum per-poem ratio.  With a small catalogue this produced binary
-- results: the single poet who had any likes got 100 %, everyone else 0 %.
--
-- New approach: log-scale normalisation against the maximum total favourite
-- count.  A poet with 0 likes always shows 0 %.  The most-liked poet shows
-- 100 %.  Anyone in between gets a smooth, meaningful percentage:
--
--   e.g.  max = 100 likes
--         1  like  → ln(2)  / ln(101) ≈  14 %
--         10 likes → ln(11) / ln(101) ≈  52 %
--         50 likes → ln(51) / ln(101) ≈  85 %
--
-- The featured_score ranking also switches to log-scale so a poet with just
-- one heavily-liked poem does not crowd out poets with a larger body of work.
create or replace function public.get_featured_poets(p_limit integer default 5)
returns table (
  id                      uuid,
  name_am                 text,
  name_en                 text,
  poem_count              bigint,
  favorite_count          bigint,
  favorites_per_poem      numeric,
  favorites_per_poem_percent numeric,
  featured_score          numeric
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
      count(distinct p.id)::bigint                                       as poem_count,
      count(f.id)::bigint                                                as favorite_count,
      count(f.id)::numeric / nullif(count(distinct p.id), 0)            as favorites_per_poem
    from public.poets     po
    join  public.poems    p  on p.poet_id = po.id
                             and p.attribution_status <> 'disputed'
    left join public.favorites f on f.poem_id = p.id
    group by po.id, po.name_am, po.name_en
  )
  select
    id,
    name_am,
    name_en,
    poem_count,
    favorite_count,
    round(coalesce(favorites_per_poem, 0), 2)                           as favorites_per_poem,

    -- Log-scale percentage: 0 likes → 0 %, max-liked poet → 100 %,
    -- all others land at proportional values in between.
    round(
      case
        when max(favorite_count) over () = 0 then 0
        else 100.0
             * ln(1 + favorite_count::numeric)
             / nullif(ln(1 + max(favorite_count) over ()), 0)
      end,
      1
    )                                                                    as favorites_per_poem_percent,

    -- Featured score: 40 % poem output + 60 % total likes, both log-scaled
    -- so the rankings are stable even with very unequal counts.
    round(
      coalesce(
        0.4 * ln(1 + poem_count::numeric)
            / nullif(ln(1 + max(poem_count) over ()), 0),
        0
      )
      + coalesce(
        0.6 * ln(1 + favorite_count::numeric)
            / nullif(ln(1 + max(favorite_count) over ()), 0),
        0
      ),
      4
    )                                                                    as featured_score

  from poet_stats
  order by featured_score desc, poem_count desc, name_am
  limit greatest(1, least(coalesce(p_limit, 5), 25));
$$;

revoke all   on function public.get_featured_poets(integer) from public;
grant execute on function public.get_featured_poets(integer)
  to anon, authenticated, service_role;

commit;
