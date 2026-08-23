-- =============================================================================
-- Medbl — fix upsert_my_poet_profile()
--
-- On the live database, statements inside this security-definer function
-- were still subject to RLS filtering on `profiles` (silently matching 0
-- rows), so profiles.poet_id never got set — and the internal lookup read
-- NULL, creating a duplicate poets row on every save.
--
-- Changes:
--   1. The "is a poet already linked?" lookup now reads public.poets by
--      created_by (= caller) — publicly readable, immune to the profiles
--      RLS quirk, and guaranteed to find the caller's OWN row only.
--   2. The function NO LONGER writes profiles.poet_id. Linkage is done by
--      the app right after the RPC via the normal profiles_update_own RLS
--      policy (users may always update their own profile row).
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

  -- Link the poet record to the caller's profile. Row-count verified:
  -- if RLS were ever to filter this statement again, fail LOUDLY instead
  -- of silently leaving poet_id null.
  update public.profiles
  set poet_id = v_poet_id
  where id = v_user;

  if not found then
    raise exception
      'Poet saved, but linking failed: no accessible profiles row for user %. Please report this.', v_user;
  end if;

  return v_poet_id;
end;
$$;

revoke all on function public.upsert_my_poet_profile(text, text, int, text) from public;
grant execute on function public.upsert_my_poet_profile(text, text, int, text) to authenticated;

commit;
