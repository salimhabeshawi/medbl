-- =============================================================================
-- Medbl — pending moderation counts for the staff notification dot
--
-- The header shows a small notification dot on the "Moderation" nav link
-- whenever a moderator has unfinished work. Rendering that dot must not
-- require the client to read the moderation queue: poem_submissions and
-- reports rows are staff-only (and reports isn't even selectable by
-- members), so a "just count it for me" read would mean widening RLS for
-- the sake of one circle.
--
-- get_moderation_pending_counts() answers exactly that question and nothing
-- more: one row, two bigints. Both counts are total rows, not page-sized
-- samples, so the header only ever learns "is there anything to do" — the
-- queue itself is still fetched by /moderate and /moderate/submissions under
-- the existing staff SELECT policies.
--
-- The `where public.is_staff()` guard is the load-bearing part: it sits on the
-- single-row query, so a non-staff caller gets ZERO ROWS instead of an error
-- (PostgREST returns an empty array, not a failure). Callers therefore treat
-- "no rows" as "nothing pending" — the same thing a non-staff user sees, which
-- matches the fact that they never get the nav link at all. The function is
-- security definer purely so the two counts can bypass the RLS that hides
-- these tables from members; every row it can read is a staff-only row.
--
-- There is deliberately no seen/unseen tracking here: the dot is a pure
-- reflection of current totals, and it keeps showing while work remains,
-- even after the moderator has opened /moderate.
-- =============================================================================

begin;

create or replace function public.get_moderation_pending_counts()
returns table (pending_submissions bigint, open_reports bigint)
language sql
stable
security definer
set search_path = public
as $$
  select
    (select count(*) from public.poem_submissions where status = 'pending') as pending_submissions,
    (select count(*) from public.reports where status = 'open') as open_reports
  where public.is_staff();
$$;

revoke all on function public.get_moderation_pending_counts() from public;
grant execute on function public.get_moderation_pending_counts() to authenticated;

commit;