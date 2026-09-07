begin;

-- Search needs to match short poem fragments as well as complete words.
-- Trigram indexes support the ILIKE predicates used by search_poems.
create extension if not exists pg_trgm;

create index if not exists poems_title_trgm_idx on public.poems
  using gin (title gin_trgm_ops);
create index if not exists poems_body_trgm_idx on public.poems
  using gin (body gin_trgm_ops);
create index if not exists poems_category_trgm_idx on public.poems
  using gin (category gin_trgm_ops);

create or replace function public.search_poems(
  p_query text,
  p_limit integer default 24
)
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
  created_at timestamptz
)
language sql
stable
security invoker
set search_path = public
as $$
  with term as (
    select '%' || replace(replace(replace(trim(p_query), E'\\', E'\\\\'), '%', E'\\%'), '_', E'\\_') || '%' as pattern,
           trim(p_query) as plain
  )
  select p.id,
         p.title,
         p.body,
         p.category,
         p.tags,
         p.attribution_status,
         p.poet_id,
         po.name_am as poet_name_am,
         po.name_en as poet_name_en,
         p.created_at
  from public.poems p
  join public.poets po on po.id = p.poet_id
  cross join term
  where p.attribution_status <> 'disputed'
    and (
      p.title ilike term.pattern escape E'\\'
      or p.body ilike term.pattern escape E'\\'
      or coalesce(p.category, '') ilike term.pattern escape E'\\'
      or coalesce(array_to_string(p.tags, ' '), '') ilike term.pattern escape E'\\'
      or po.name_am ilike term.pattern escape E'\\'
      or coalesce(po.name_en, '') ilike term.pattern escape E'\\'
    )
  order by greatest(
    similarity(p.title, term.plain),
    similarity(p.body, term.plain),
    similarity(po.name_am, term.plain),
    similarity(coalesce(po.name_en, ''), term.plain)
  ) desc, p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 24), 100));
$$;

revoke all on function public.search_poems(text, integer) from public;
grant execute on function public.search_poems(text, integer) to anon, authenticated, service_role;

commit;
