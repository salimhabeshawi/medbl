-- =============================================================================
-- Medbl — poem view counts
--
-- Every poem tracks how many times its detail page (/poems/[id]) has been
-- opened. The count increments once per server request for the poem detail
-- page via the security-definer increment_poem_view() RPC — never when a poem
-- merely appears in a list/card context, and never through any direct UPDATE
-- (anon/authenticated have no UPDATE grant on poems; the RPC is the only path,
-- matching the approve_poem_submission() pattern).
--
-- No deduplication by session/cookie/IP by design: a refresh counts as a view.
-- =============================================================================

begin;

-- 1. Column. Existing poems start at 0.
alter table public.poems
  add column view_count integer not null default 0;

-- 2. Increment RPC. Intentionally callable by anonymous visitors (poem pages
--    are public), so there is no authorization check. A bad id is a no-op.
create or replace function public.increment_poem_view(p_poem_id uuid)
returns void
language sql
security definer
set search_path = public
as $$
  update public.poems
  set view_count = view_count + 1
  where id = p_poem_id;
$$;

revoke all on function public.increment_poem_view(uuid) from public;
grant execute on function public.increment_poem_view(uuid) to anon, authenticated, service_role;

-- 3. get_featured_poems: expose view_count so featured-poem cards on the home
--    page can display it like every other poem card. Must drop first because
--    the return type changes.
drop function if exists public.get_featured_poems(integer);
create or replace function public.get_featured_poems(p_limit integer default 5)
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
    count(f.id)::bigint
  from public.poems p
  join public.poets po on po.id = p.poet_id
  left join public.categories c on c.id = p.category_id
  left join public.favorites f on f.poem_id = p.id
  where p.attribution_status <> 'disputed'
  group by p.id, p.title, p.body, p.category_id, c.name_am, c.name_en,
           p.tags, p.attribution_status, p.poet_id, po.name_am, po.name_en,
           p.poem_number, p.view_count
  order by count(f.id) desc, p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 5), 25));
$$;

revoke all on function public.get_featured_poems(integer) from public;
grant execute on function public.get_featured_poems(integer) to anon, authenticated, service_role;

commit;