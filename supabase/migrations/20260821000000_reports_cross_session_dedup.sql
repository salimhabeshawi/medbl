-- =============================================================================
-- Medbl — cross-session report dedup
--
-- 1. Hard enforcement: at most one OPEN report per (poem, reporter).
--    Partial unique index so a RESOLVED report never blocks a legitimate
--    re-report. reported_by is nullable; NULLs stay distinct in Postgres
--    unique indexes, so hypothetical unauthenticated reports are unaffected.
--
-- 2. UI state: members cannot SELECT from reports (RLS is staff-only by
--    design, per AGENTS.md), so the poem page can't query "my open report"
--    directly. has_open_report() is a narrow security-definer RPC that
--    answers exactly that question for the caller only — no row data leaks.
-- =============================================================================

begin;

create unique index reports_open_poem_reporter_key
  on public.reports (poem_id, reported_by)
  where status = 'open';

create or replace function public.has_open_report(p_poem_id uuid)
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.reports
    where poem_id = p_poem_id
      and reported_by = auth.uid()
      and status = 'open'
  )
$$;

revoke all on function public.has_open_report(uuid) from public;
grant execute on function public.has_open_report(uuid) to authenticated, service_role;

commit;
