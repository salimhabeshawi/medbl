-- =============================================================================
-- Medbl — users may edit and cancel their own PENDING submissions
--
-- Until now only staff could update a submission
-- (poem_submissions_update_staff_all) and nobody but service_role could delete
-- one, so a user who spotted a typo in a still-pending submission had no way to
-- correct it and no way to withdraw it before a moderator reviewed it.
--
-- Two own-row policies, both scoped to `submitted_by = auth.uid()` AND
-- `status = 'pending'`:
--
--   * poem_submissions_update_own — the edit form on /my-submissions. Saves in
--     place (the existing poem_submissions row is updated, never duplicated)
--     and leaves `status` as 'pending'.
--   * poem_submissions_delete_own — the cancel action on /my-submissions.
--     Hard delete: there is deliberately no "cancelled" status, so a user who
--     withdraws a submission simply resubmits if they change their mind.
--
-- The `status = 'pending'` guard is the load-bearing part. RLS policies are
-- OR-ed together, and the only other update path is the staff policy, so for a
-- regular user the moment a moderator approves or rejects the row the USING
-- clause stops matching and the database rejects the write — no client input
-- can change that. Staff keep working through poem_submissions_update_staff_all
-- regardless of status. Nothing here can reach another user's rows: `submitted_by`
-- is compared against auth.uid() in both the USING and the WITH CHECK clause.
-- =============================================================================

begin;

-- PostgreSQL has no "create policy if not exists", so the drop keeps this
-- migration re-runnable without failing on an already-applied policy.
drop policy if exists "poem_submissions_update_own" on public.poem_submissions;
create policy "poem_submissions_update_own" on public.poem_submissions
  for update to authenticated
  using (auth.uid() = submitted_by and status = 'pending')
  with check (auth.uid() = submitted_by and status = 'pending');

drop policy if exists "poem_submissions_delete_own" on public.poem_submissions;
create policy "poem_submissions_delete_own" on public.poem_submissions
  for delete to authenticated
  using (auth.uid() = submitted_by and status = 'pending');

-- A delete policy is unreachable without the table privilege: the initial
-- schema granted `authenticated` only select, insert and update on this table.
grant delete on public.poem_submissions to authenticated;

commit;
