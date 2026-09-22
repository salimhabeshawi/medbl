-- =============================================================================
-- Medbl — sequential, human-facing poem numbers
--
-- Every published poem gets a stable, system-assigned `poem_number` (shown in
-- the UI as "#N"). Numbers reflect the order rows entered the `poems` table
-- (i.e. approval/publish order), not the original submission order.
--
-- The column is backed by a dedicated sequence so every future INSERT — which
-- only ever happens via the security-definer approve_poem_submission() —
-- automatically receives the next number. No client can set or edit it:
-- anon/authenticated have no INSERT/UPDATE grants on poems at all, and no
-- client payload ever includes the column.
--
-- The whole migration runs in ONE transaction: the ALTER TABLE takes an
-- ACCESS EXCLUSIVE lock on poems until commit, so no poem can be inserted
-- between adding the column and the backfill. That makes the "new rows
-- inserted between column-add and backfill" race impossible by construction.
-- =============================================================================

begin;

-- 1. Dedicated sequence + column. Adding a column with a volatile default
--    rewrites existing rows consuming the sequence, but the backfill below
--    immediately overwrites those provisional values in true publish order.
create sequence public.poems_poem_number_seq;

alter table public.poems
  add column poem_number integer not null default nextval('public.poems_poem_number_seq') unique;

-- Tie the sequence's lifecycle to the column (dropped with the column).
alter sequence public.poems_poem_number_seq owned by public.poems.poem_number;

-- 2. Backfill: created_at ascending, id ascending as the stable tiebreaker
--    for identical timestamps.
with numbered as (
  select id, row_number() over (order by created_at asc, id asc) as rn
  from public.poems
)
update public.poems p
set poem_number = numbered.rn
from numbered
where p.id = numbered.id;

-- 3. Advance the sequence past the highest assigned number so the next
--    naturally-inserted poem continues without gaps or collisions.
--    (Empty-table-safe: setval(..., 1, false) makes the next nextval() 1.)
do $$
declare
  v_max integer;
begin
  select max(poem_number) into v_max from public.poems;
  if v_max is null then
    perform setval('public.poems_poem_number_seq', 1, false);
  else
    perform setval('public.poems_poem_number_seq', v_max);
  end if;
end;
$$;

-- 4. get_featured_poems: expose poem_number so featured-poem cards on the
--    home page can display the number like every other poem card. Must drop
--    first because the return type changes.
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
    count(f.id)::bigint
  from public.poems p
  join public.poets po on po.id = p.poet_id
  left join public.categories c on c.id = p.category_id
  left join public.favorites f on f.poem_id = p.id
  where p.attribution_status <> 'disputed'
  group by p.id, p.title, p.body, p.category_id, c.name_am, c.name_en,
           p.tags, p.attribution_status, p.poet_id, po.name_am, po.name_en,
           p.poem_number
  order by count(f.id) desc, p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 5), 25));
$$;

revoke all on function public.get_featured_poems(integer) from public;
grant execute on function public.get_featured_poems(integer) to anon, authenticated, service_role;

commit;