-- =============================================================================
-- Medbl — reporters can withdraw their own OPEN report
--
-- Until now the reports table was write-once for members: they could insert a
-- report (reports_insert_authenticated) and nothing else — reads and updates
-- are staff-only, and no delete policy existed at all. A user who filed a
-- report by mistake, or who changed their mind before a moderator looked at
-- it, had no way to take it back: the row simply sat in the moderation queue
-- and could even get the poet's poem disputed because of it.
--
-- One own-row policy, scoped to `reported_by = auth.uid()` AND `status = 'open'`:
--
--   reports_delete_own_open — the "Cancel report" action on /poems/[id].
--     Hard delete: there is deliberately no "cancelled" status, so a user who
--     withdraws a report simply files a new one if they change their mind (the
--     partial unique index reports_open_poem_reporter_key only blocks a second
--     OPEN report, so a resolved or deleted one never blocks a re-report).
--
-- The `status = 'open'` guard is the load-bearing part. RLS policies are OR-ed
-- together, so for a regular user the moment a moderator resolves the report
-- the USING clause stops matching and the database rejects the write — no
-- client input can change that, which is exactly the "once it has been
-- reviewed, you can no longer take it back" rule. Staff are unaffected: they
-- keep full select/update through reports_select_staff / reports_update_staff,
-- and service_role is unaffected by RLS entirely.
--
-- Nothing here can reach another user's rows: `reported_by` is compared
-- against auth.uid(), and reported_by is only ever set to the caller's own id
-- by reportPoem() server-side.
--
-- has_open_report() needs no change — it already answers "do I have an open
-- report on this poem", which is both what drives the "already reported" UI
-- and what tells that UI whether a cancel option exists.
-- =============================================================================

begin;

-- PostgreSQL has no "create policy if not exists", so the drop keeps this
-- migration re-runnable without failing on an already-applied policy.
drop policy if exists "reports_delete_own_open" on public.reports;
create policy "reports_delete_own_open" on public.reports
  for delete to authenticated
  using (auth.uid() = reported_by and status = 'open');

-- A delete policy is unreachable without the table privilege: the initial
-- schema granted `authenticated` only select, insert and update on this table.
grant delete on public.reports to authenticated;

commit;