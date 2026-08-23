-- =============================================================================
-- Medbl — profile poet link + upsert_my_poet_profile()
--
-- profiles.poet_id links a user to their OWN poet record (null until they
-- save their poet details on /profile). The ONLY way a regular user creates
-- or edits that linked poet row is the security-definer function below —
-- no direct RLS insert/update policy on poets for regular users, by design.
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- profiles.poet_id: nullable FK with a unique constraint (one linked poet per
-- user; many NULLs are allowed). on delete set null keeps the profile if the
-- poet row is ever removed.
-- -----------------------------------------------------------------------------
alter table public.profiles
  add column poet_id uuid references public.poets (id) on delete set null;

alter table public.profiles
  add constraint profiles_poet_id_key unique (poet_id);

create index profiles_poet_id_idx on public.profiles (poet_id);

-- -----------------------------------------------------------------------------
-- Create-or-update the calling user's own linked poet record.
--   - first save:  inserts into poets (verified = false, created_by = user)
--                  and links it via profiles.poet_id;
--   - later saves: update the same linked row (only if still owned by the
--                  caller — extra safety check).
-- Follows the approve_poem_submission() pattern: security definer, explicit
-- auth check inside, revoke from public, grant to authenticated only.
-- -----------------------------------------------------------------------------
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

  select poet_id into v_current_poet_id
  from public.profiles
  where id = v_user;

  if v_current_poet_id is null then
    insert into public.poets (
      name_am, name_en, bio, birth_year, verified, created_by
    )
    values (
      btrim(p_name_am), p_name_en, p_bio, p_birth_year, false, v_user
    )
    returning id into v_poet_id;

    update public.profiles
    set poet_id = v_poet_id
    where id = v_user;
  else
    -- Safety check: only ever touch a poet row this user created/owns.
    select id into v_poet_id
    from public.poets
    where id = v_current_poet_id
      and created_by = v_user;

    if v_poet_id is null then
      raise exception 'Linked poet record is not owned by this account';
    end if;

    update public.poets
    set name_am = btrim(p_name_am),
        name_en = p_name_en,
        bio = p_bio,
        birth_year = p_birth_year
    where id = v_poet_id;
  end if;

  return v_poet_id;
end;
$$;

revoke all on function public.upsert_my_poet_profile(text, text, int, text) from public;
grant execute on function public.upsert_my_poet_profile(text, text, int, text) to authenticated;

commit;
