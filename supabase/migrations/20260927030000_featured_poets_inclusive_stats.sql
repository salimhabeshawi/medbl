-- =============================================================================
-- Medbl — get_featured_poets: inclusive stats + avg likes per poem
--
-- Two corrections to the featured-poets ranking:
--
-- 1. Disputed poems are now INCLUDED in the stats. The previous version
--    filtered them out of the aggregate (`p.attribution_status <>
--    'disputed'`), which contradicted the "Disputed poems" flow: a disputed
--    poem stays publicly visible and readable, so it is still part of the
--    poet's body of work. Under-counting it also silently dropped the
--    favourites sitting on that poem, because `favorite_count` is the sum of
--    `favorites` joined through the very same (filtered) poem rows — one
--    exclusion in the JOIN removed a poem, its likes, and its weight in the
--    ranking score at once.
--
--    The ranking FORMULA is unchanged (40 % poem output / 60 % total likes,
--    both log-scaled against the maximum across all poets). Only its inputs
--    are corrected: `poem_count` and `favorite_count` are now inclusive of
--    disputed poems, so poets who happen to have a disputed poem stop being
--    penalised for it. `liked_poem_count` follows the same rule.
--
-- 2. `favorites_per_poem` + `favorites_per_poem_percent` are replaced by a
--    single, honest number: `avg_likes_per_poem` = favorite_count /
--    poem_count, as a raw average (e.g. 3.2), not a percentage. The old
--    percentage was a log-scale normalisation against the most-liked poet
--    (favourites_per_poem_percent) — a relative score, not a rate, and its
--    name said "per poem" while it was really "per poet vs. the leader".
--
--    The average is only returned once a poet has at least
--    v_avg_likes_min_poems poems: an average over a single poem is just that
--    poem's like count wearing an average's clothes. Below the threshold the
--    field is NULL and the UI omits the badge. The threshold is a judgement
--    call and may be tuned as the collection grows — it is a single constant
--    below, and the frontend simply renders whatever the RPC returns (see
--    MIN_POEMS_FOR_AVG_LIKES in app/page.tsx, which only guards the fallback
--    query, not the RPC path).
--
-- The threshold affects this stat ONLY: it does not change featured_score and
-- it does not remove a poet from the list — a poet with one poem still ranks
-- and appears normally, just without an average.
--
-- Return type changes (two columns out, one in), so the function is dropped and
-- recreated, matching the previous replacements of this function.
-- =============================================================================

begin;

drop function if exists public.get_featured_poets(integer);

create function public.get_featured_poets(p_limit integer default 5)
returns table (
  id                 uuid,
  name_am            text,
  name_en            text,
  poem_count         bigint,
  liked_poem_count   bigint,
  favorite_count     bigint,
  avg_likes_per_poem numeric,
  featured_score     numeric
)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  -- EASY TO ADJUST: minimum number of published poems a poet needs before
  -- avg_likes_per_poem is computed at all. Below it → NULL (stat hidden).
  v_avg_likes_min_poems constant integer := 2;
begin
  return query
  with poet_stats as (
    select
      po.id,
      po.name_am,
      po.name_en,
      -- INCLUSIVE of disputed poems — see the header comment.
      count(distinct p.id)::bigint                                     as poem_count,
      count(distinct case when f.id is not null then p.id end)::bigint as liked_poem_count,
      count(f.id)::bigint                                              as favorite_count
    from public.poets         po
    join   public.poems         p on p.poet_id = po.id
    left join public.favorites  f on f.poem_id = p.id
    group by po.id, po.name_am, po.name_en
  )
  select
    poet_stats.id,
    poet_stats.name_am,
    poet_stats.name_en,
    poet_stats.poem_count,
    poet_stats.liked_poem_count,
    poet_stats.favorite_count,
    case
      when poet_stats.poem_count >= v_avg_likes_min_poems
        then round(
               poet_stats.favorite_count::numeric
                 / poet_stats.poem_count::numeric,
               1
             )
    end                                                                  as avg_likes_per_poem,
    -- Ranking score: 40 % poem output + 60 % total likes, both log-scaled
    -- against the maximum across all poets. Unchanged formula, corrected
    -- (disputed-inclusive) inputs.
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
    )                                                                  as featured_score
  from poet_stats
  order by featured_score desc, poet_stats.poem_count desc, poet_stats.name_am
  limit greatest(1, least(coalesce(p_limit, 5), 25));
end;
$$;

revoke all   on function public.get_featured_poets(integer) from public;
grant execute on function public.get_featured_poets(integer)
  to anon, authenticated, service_role;

commit;
