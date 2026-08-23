-- =============================================================================
-- Medbl — self-healing profile link
--
-- Diagnosis from production: the failing account had NO profiles row at all
-- (slipped past the on_auth_user_created trigger), so every path that tried
-- to set profiles.poet_id — definer or client-side — silently matched zero
-- rows. Reads elsewhere treat "missing profile" as plain member, which is
-- why nothing else surfaced.
--
-- Fix: upsert_my_poet_profile() now creates the missing profiles row
-- (security definer — same trusted context that creates the poets row),
-- retries the link, and still fails LOUDLY if linking is impossible for
-- any other reason.
-- =============================================================================

begin;

create or replace function public.upsert_my_poet_profile(
  p_name_am text,
  p_name_en text default null,
  p_birth_year int default null,
  p_bio text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_user uuid := auth.uid();
  v_current_poet_id uuid;
  v_poet_id uuid;
begin
  if v_user is null then
    raise exception 'Not authorized: you must be logged in';
  end if;

  if p_name_am is null or btrim(p_name_am) = '' then
    raise exception 'Amharic name is required';
  end if;

  -- Find the caller's OWN existing poet record (public table — no RLS
  -- surprises). Oldest wins so repeat saves converge on one row.
  select id into v_current_poet_id
  from public.poets
  where created_by = v_user
  order by created_at asc
  limit 1;

  if v_current_poet_id is null then
    insert into public.poets (
      name_am, name_en, bio, birth_year, verified, created_by
    )
    values (
      btrim(p_name_am), p_name_en, p_bio, p_birth_year, false, v_user
    )
    returning id into v_poet_id;
  else
    update public.poets
    set name_am = btrim(p_name_am),
        name_en = p_name_en,
        bio = p_bio,
        birth_year = p_birth_year
    where id = v_current_poet_id
      and created_by = v_user;

    v_poet_id := v_current_poet_id;
  end if;

  -- Link the poet record to the caller's profile. Self-heal a missing
  -- profile row (pre-trigger signups); otherwise fail loudly.
  update public.profiles
  set poet_id = v_poet_id
  where id = v_user;

  if not found then
    insert into public.profiles (id)
    values (v_user)
    on conflict (id) do nothing;

    update public.profiles
    set poet_id = v_poet_id
    where id = v_user;

    if not found then
      raise exception
        'Poet saved, but linking failed: profiles row for % exists yet is not accessible. Please report this.', v_user;
    end if;
  end if;

  return v_poet_id;
end;
$$;

revoke all on function public.upsert_my_poet_profile(text, text, int, text) from public;
grant execute on function public.upsert_my_poet_profile(text, text, int, text) to authenticated;

commit;
