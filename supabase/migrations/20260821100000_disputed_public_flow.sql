-- =============================================================================
-- Medbl — public disputed flow
--
-- Product decision (supersedes the original AGENTS.md "hide disputed poems"
-- rule): a disputed poem stays publicly readable everywhere and is shown
-- with a red "disputed" tag instead of disappearing.
--
-- 1. poems_select_public now allows every row; the red tag is a UI concern.
-- 2. Moderators may permanently remove a poem ("Remove" on a report card).
--    The delete cascades to favorites and reports via existing FKs.
-- 3. reports.former_attribution_status remembers the pre-dispute tag
--    ('verified' | 'community') so "Republish" can restore it exactly.
-- =============================================================================

begin;

drop policy "poems_select_public" on public.poems;
create policy "poems_select_public" on public.poems
  for select to anon, authenticated
  using (true);

create policy "poems_delete_staff" on public.poems
  for delete to authenticated
  using (public.is_staff());
grant delete on public.poems to authenticated;

alter table public.reports
  add column former_attribution_status public.attribution_status;

commit;
