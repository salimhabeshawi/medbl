begin;

-- 1. Rename 'name' to 'name_en' and add 'name_am' to categories
alter table public.categories rename column name to name_en;
alter table public.categories add column name_am text;

-- Drop old unique constraint if it exists and add new unique constraint on name_en
alter table public.categories drop constraint if exists categories_name_key;
alter table public.categories add constraint categories_name_en_key unique (name_en);

-- Backfill default categories with Amharic names
update public.categories set name_am = 'ፍቅር' where name_en = 'Love';
update public.categories set name_am = 'ባህል' where name_en = 'Culture';
update public.categories set name_am = 'ተፈጥሮ' where name_en = 'Nature';
update public.categories set name_am = 'መንፈሳዊነት' where name_en = 'Spirituality';
update public.categories set name_am = 'ህብረተሰብ' where name_en = 'Society';
update public.categories set name_am = 'ታሪክ' where name_en = 'History';
update public.categories set name_am = 'ዘመናዊ' where name_en = 'Contemporary';

-- 2. Add category_id foreign key columns to poem_submissions and poems
alter table public.poem_submissions
  add column if not exists category_id uuid references public.categories(id) on delete set null;

alter table public.poems
  add column if not exists category_id uuid references public.categories(id) on delete set null;

-- Backfill existing poem_submissions and poems using exact match on name_en or name_am
update public.poem_submissions ps
set category_id = c.id
from public.categories c
where ps.category_id is null
  and ps.category is not null
  and (ps.category = c.name_en or ps.category = c.name_am);

update public.poems p
set category_id = c.id
from public.categories c
where p.category_id is null
  and p.category is not null
  and (p.category = c.name_en or p.category = c.name_am);

-- Do not drop copied category text when it cannot be matched confidently.
-- Failing here preserves the original columns and gives the operator the
-- exact values that need a manual mapping before this migration is retried.
do $$
declare
  unmatched text;
begin
  select string_agg(value, ', ' order by value)
    into unmatched
  from (
    select distinct category as value
    from public.poems
    where category is not null and category_id is null
    union
    select distinct category as value
    from public.poem_submissions
    where category is not null and category_id is null
  ) values_to_match;

  if unmatched is not null then
    raise exception 'Unmatched category values; add explicit mappings before retrying: %', unmatched;
  end if;
end;
$$;

-- Drop old text category columns and old index
drop index if exists public.poems_category_trgm_idx;

alter table public.poem_submissions drop column category;
alter table public.poems drop column category;

create index if not exists poems_category_id_idx on public.poems(category_id);
create index if not exists poem_submissions_category_id_idx on public.poem_submissions(category_id);

-- 3. Update delete_category function
create or replace function public.delete_category(p_category_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_staff() then
    raise exception 'Not authorized';
  end if;
  if exists (select 1 from public.poems where category_id = p_category_id)
     or exists (select 1 from public.poem_submissions where category_id = p_category_id) then
    raise exception 'Category is still used by a poem or submission';
  end if;
  delete from public.categories where id = p_category_id;
end;
$$;

revoke all on function public.delete_category(uuid) from public;
grant execute on function public.delete_category(uuid) to authenticated, service_role;

-- 4. Update approve_poem_submission function to copy category_id
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
  set status = 'approved', reviewed_by = auth.uid()
  where id = p_submission_id;

  return v_poem_id;
end;
$$;

revoke all on function public.approve_poem_submission(uuid, public.attribution_status, uuid) from public;
grant execute on function public.approve_poem_submission(uuid, public.attribution_status, uuid) to authenticated, service_role;

-- 5. Update search_poems function
-- Must drop first because the return type changes (category text → category_id uuid + bilingual name columns).
drop function if exists public.search_poems(text, integer);
create or replace function public.search_poems(
  p_query text,
  p_limit integer default 24
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
         p.category_id,
         c.name_am as category_name_am,
         c.name_en as category_name_en,
         p.tags,
         p.attribution_status,
         p.poet_id,
         po.name_am as poet_name_am,
         po.name_en as poet_name_en,
         p.created_at
  from public.poems p
  join public.poets po on po.id = p.poet_id
  left join public.categories c on c.id = p.category_id
  cross join term
  where p.attribution_status <> 'disputed'
    and (
      p.title ilike term.pattern escape E'\\'
      or p.body ilike term.pattern escape E'\\'
      or coalesce(c.name_am, '') ilike term.pattern escape E'\\'
      or coalesce(c.name_en, '') ilike term.pattern escape E'\\'
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

-- 6. Update get_featured_poems function
-- Must drop first because the return type changes (category text → category_id uuid + bilingual name columns).
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
    count(f.id)::bigint
  from public.poems p
  join public.poets po on po.id = p.poet_id
  left join public.categories c on c.id = p.category_id
  left join public.favorites f on f.poem_id = p.id
  where p.attribution_status <> 'disputed'
  group by p.id, p.title, p.body, p.category_id, c.name_am, c.name_en,
           p.tags, p.attribution_status, p.poet_id, po.name_am, po.name_en
  order by count(f.id) desc, p.created_at desc
  limit greatest(1, least(coalesce(p_limit, 5), 25));
$$;

revoke all on function public.get_featured_poems(integer) from public;
grant execute on function public.get_featured_poems(integer) to anon, authenticated, service_role;

commit;
