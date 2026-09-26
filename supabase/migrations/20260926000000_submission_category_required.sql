-- =============================================================================
-- Medbl — category is mandatory on new poem submissions
--
-- Every submission must now carry a category. Legacy submissions that predate
-- the categories registry are backfilled onto a dedicated "Uncategorized"
-- fallback category (never a null), then the NOT NULL constraint is applied.
--
-- poems.category_id intentionally stays NULLABLE: historical published poems
-- may predate the categories feature and this change is about submissions
-- going forward, not a retroactive fix of the published archive.
-- =============================================================================

begin;

-- 1. Fallback category. Re-running is safe: the unique name_en column makes
--    this a no-op when a category named "Uncategorized" already exists.
insert into public.categories (name_en, name_am, created_by)
values ('Uncategorized', 'ያልተመደበ', null)
on conflict (name_en) do nothing;

-- 2. Backfill every previously category-less submission onto that fallback so
--    the constraint below can be applied without losing any submission.
update public.poem_submissions
set category_id = (select id from public.categories where name_en = 'Uncategorized')
where category_id is null;

-- 3. Enforce it going forward. (The submit form and submitPoem() also validate
--    this client- and server-side; this is the last line of defence.)
alter table public.poem_submissions
  alter column category_id set not null;

commit;
