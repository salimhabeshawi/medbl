-- =============================================================================
-- Medbl — merge poet proposal into poem submissions
--
-- Replaces the standalone poet_requests flow: a user proposing a new poet
-- now does it INLINE on their poem submission. poem_submissions carries
-- either an existing poet_id OR proposed_* poet fields (never both, never
-- neither — enforced by poem_submissions_poet_xor). The poet row is only
-- created when a moderator approves.
--
-- Also adds pg_trgm fuzzy matching so moderators can spot an existing poet
-- matching the proposal (avoiding duplicates), and reworks
-- approve_poem_submission to resolve the final poet at approval time.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- pg_trgm + trigram indexes for fuzzy poet-name matching
-- -----------------------------------------------------------------------------
create extension if not exists pg_trgm;

create index poets_name_am_trgm_idx on public.poets
  using gin (name_am gin_trgm_ops);
create index poets_name_en_trgm_idx on public.poets
  using gin (name_en gin_trgm_ops);

-- -----------------------------------------------------------------------------
-- poem_submissions: nullable poet_id + inline proposal columns + XOR check
-- (source is reused for the proposed poet's sourcing — no duplicate column)
-- -----------------------------------------------------------------------------
alter table public.poem_submissions
  alter column poet_id drop not null;

alter table public.poem_submissions
  add column proposed_poet_name_am text,
  add column proposed_poet_name_en text,
  add column proposed_poet_bio text;

alter table public.poem_submissions
  add constraint poem_submissions_poet_xor check (
    (poet_id is not null and proposed_poet_name_am is null)
    or (poet_id is null and proposed_poet_name_am is not null)
  );

-- -----------------------------------------------------------------------------
-- poet_requests is fully replaced by the columns above
-- (table drop removes its RLS policies and grants with it)
-- -----------------------------------------------------------------------------
drop index if exists poet_requests_status_idx;
drop table public.poet_requests;

-- -----------------------------------------------------------------------------
-- Top-3 existing poets similar to a proposed name, for the moderator card.
-- Uses the % operator so the GIN trigram indexes apply; the session-level
-- similarity_threshold is lowered to 0.2 for this lookup per product spec.
-- security invoker: poets are publicly readable anyway; callers are staff.
-- -----------------------------------------------------------------------------
create or replace function public.match_poets(p_name text)
returns table (id uuid, name_am text, name_en text, bio text, score real)
language sql
stable
security invoker
set search_path = public
set pg_trgm.similarity_threshold = '0.2'
as $$
  select po.id,
         po.name_am,
         po.name_en,
         po.bio,
         greatest(similarity(po.name_am, p_name),
                  similarity(coalesce(po.name_en, ''), p_name)) as score
  from public.poets po
  where po.name_am % p_name
     or coalesce(po.name_en, '') % p_name
  order by score desc
  limit 3;
$$;

revoke all on function public.match_poets(text) from public;
grant execute on function public.match_poets(text) to authenticated, service_role;

-- -----------------------------------------------------------------------------
-- approve_poem_submission v2: resolve the poet at approval time.
--   1. explicit p_poet_id wins (original poet, or moderator's fuzzy match);
--   2. else if the submission proposes a new poet, create it
--      (verified = false, created_by = submitter);
--   3. else fall back to the submission's own poet_id.
-- Security definer + is_staff() enforcement unchanged; grants move to the
-- new signature (old 2-arg version dropped).
-- -----------------------------------------------------------------------------
drop function if exists public.approve_poem_submission(uuid, public.attribution_status);

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
    -- Moderator's explicit choice; must reference a real poet.
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
    poet_id, title, body, category, tags, attribution_status, source, submitted_by
  )
  values (
    v_resolved_poet_id, v_sub.title, v_sub.body, v_sub.category, v_sub.tags,
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

commit;
