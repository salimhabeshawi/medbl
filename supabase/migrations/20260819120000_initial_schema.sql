-- =============================================================================
-- Medbl — initial schema + Row-Level Security
-- Implements the "Data model" and "RLS" sections of AGENTS.md exactly.
--
-- Tables: profiles, poets, poet_requests, poem_submissions, poems,
--         favorites, reports
-- Order matters: helper functions must exist before policies reference them,
-- and parent tables before tables that FK into them.
-- Run this single file from top to bottom in the Supabase SQL editor, or via
--   npx supabase db push
-- =============================================================================

begin;

-- -----------------------------------------------------------------------------
-- enums
-- -----------------------------------------------------------------------------
create type public.user_role as enum ('member', 'moderator', 'admin');
create type public.request_status as enum ('pending', 'approved', 'rejected');
create type public.attribution_status as enum ('verified', 'community', 'disputed');
create type public.report_status as enum ('open', 'resolved');

-- -----------------------------------------------------------------------------
-- profiles (role for each auth user; default role = member)
-- NOTE: created before the role helper functions below, because those are
-- SQL-language functions validated against the table at creation time.
-- -----------------------------------------------------------------------------
create table public.profiles (
  id uuid primary key references auth.users (id) on delete cascade,
  role public.user_role not null default 'member',
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- create a profile row automatically on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- updated_at maintenance
create or replace function public.set_updated_at()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  new.updated_at := now();
  return new;
end;
$$;

create trigger profiles_set_updated_at
  before update on public.profiles
  for each row execute procedure public.set_updated_at();

-- -----------------------------------------------------------------------------
-- role helper functions (security definer so RLS policies can read profiles)
-- -----------------------------------------------------------------------------
create or replace function public.get_my_role()
returns public.user_role
language sql
stable
security definer
set search_path = public
as $$
  select role from public.profiles where id = auth.uid()
$$;

create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role in ('moderator', 'admin')
  )
$$;

create or replace function public.is_admin()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  )
$$;

revoke all on function public.get_my_role() from public;
revoke all on function public.is_staff() from public;
revoke all on function public.is_admin() from public;
grant execute on function public.get_my_role() to anon, authenticated, service_role;
grant execute on function public.is_staff() to anon, authenticated, service_role;
grant execute on function public.is_admin() to anon, authenticated, service_role;

-- -----------------------------------------------------------------------------
-- poets (curated registry)
-- -----------------------------------------------------------------------------
create table public.poets (
  id uuid primary key default gen_random_uuid(),
  name_am text not null,
  name_en text,
  bio text,
  birth_year integer,
  death_year integer,
  verified boolean not null default false,
  created_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now(),
  constraint poets_birth_sane check (birth_year is null or death_year is null or death_year >= birth_year)
);

-- -----------------------------------------------------------------------------
-- poet_requests
-- -----------------------------------------------------------------------------
create table public.poet_requests (
  id uuid primary key default gen_random_uuid(),
  requested_by uuid not null references auth.users (id) on delete cascade,
  name_am text not null,
  name_en text,
  bio text,
  source text,
  status public.request_status not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- poem_submissions (nothing here is public)
-- -----------------------------------------------------------------------------
create table public.poem_submissions (
  id uuid primary key default gen_random_uuid(),
  submitted_by uuid not null references auth.users (id) on delete cascade,
  poet_id uuid not null references public.poets (id) on delete restrict,
  title text not null,
  body text not null,
  category text,
  tags text[],
  source text not null,
  status public.request_status not null default 'pending',
  reviewed_by uuid references auth.users (id) on delete set null,
  rejection_reason text,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- poems (public, published only)
-- -----------------------------------------------------------------------------
create table public.poems (
  id uuid primary key default gen_random_uuid(),
  poet_id uuid not null references public.poets (id) on delete restrict,
  title text not null,
  body text not null,
  category text,
  tags text[],
  attribution_status public.attribution_status not null default 'community',
  source text,
  submitted_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- favorites
-- -----------------------------------------------------------------------------
create table public.favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users (id) on delete cascade,
  poem_id uuid not null references public.poems (id) on delete cascade,
  created_at timestamptz not null default now(),
  unique (user_id, poem_id)
);

-- -----------------------------------------------------------------------------
-- reports
-- -----------------------------------------------------------------------------
create table public.reports (
  id uuid primary key default gen_random_uuid(),
  poem_id uuid not null references public.poems (id) on delete cascade,
  reported_by uuid references auth.users (id) on delete set null,
  reason text not null,
  status public.report_status not null default 'open',
  resolved_by uuid references auth.users (id) on delete set null,
  created_at timestamptz not null default now()
);

-- -----------------------------------------------------------------------------
-- indexes
-- -----------------------------------------------------------------------------
create index poets_name_am_idx on public.poets (name_am);
create index poets_verified_idx on public.poets (verified);
create index poet_requests_status_idx on public.poet_requests (status);
create index poem_submissions_status_idx on public.poem_submissions (status);
create index poem_submissions_poet_id_idx on public.poem_submissions (poet_id);
create index poems_poet_id_idx on public.poems (poet_id);
create index poems_attribution_status_idx on public.poems (attribution_status);
create index favorites_user_id_idx on public.favorites (user_id);
create index favorites_poem_id_idx on public.favorites (poem_id);
create index reports_poem_id_idx on public.reports (poem_id);
create index reports_status_idx on public.reports (status);

-- -----------------------------------------------------------------------------
-- server-side moderation function: promote an approved submission into poems
-- This is the ONLY supported way poems rows get created. Security definer +
-- RLS (no direct INSERT policy on poems) means end users can never write it.
-- -----------------------------------------------------------------------------
create or replace function public.approve_poem_submission(
  p_submission_id uuid,
  p_attribution_status public.attribution_status default 'community'
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_sub public.poem_submissions;
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

  insert into public.poems (
    poet_id, title, body, category, tags, attribution_status, source, submitted_by
  )
  values (
    v_sub.poet_id, v_sub.title, v_sub.body, v_sub.category, v_sub.tags,
    p_attribution_status, v_sub.source, v_sub.submitted_by
  )
  returning id into v_poem_id;

  update public.poem_submissions
  set status = 'approved', reviewed_by = auth.uid()
  where id = p_submission_id;

  return v_poem_id;
end;
$$;

revoke all on function public.approve_poem_submission(uuid, public.attribution_status) from public;
grant execute on function public.approve_poem_submission(uuid, public.attribution_status) to authenticated, service_role;

-- =============================================================================
-- Row-Level Security
-- =============================================================================

alter table public.profiles enable row level security;
alter table public.poets enable row level security;
alter table public.poet_requests enable row level security;
alter table public.poem_submissions enable row level security;
alter table public.poems enable row level security;
alter table public.favorites enable row level security;
alter table public.reports enable row level security;

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
-- users can read their own profile
create policy "profiles_select_own" on public.profiles
  for select to authenticated
  using (auth.uid() = id);

-- staff can read all profiles
create policy "profiles_select_staff_all" on public.profiles
  for select to authenticated
  using (public.is_staff());

-- users can update their own profile but must keep the same role (no self-promotion)
create policy "profiles_update_own" on public.profiles
  for update to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id and role = public.get_my_role());

-- admins can update any profile (promote/demote)
create policy "profiles_update_admin_all" on public.profiles
  for update to authenticated
  using (public.is_admin())
  with check (public.is_admin());

-- -----------------------------------------------------------------------------
-- poets
-- -----------------------------------------------------------------------------
-- public read
create policy "poets_select_public" on public.poets
  for select to anon, authenticated
  using (true);

-- insert restricted to moderator/admin
create policy "poets_insert_staff" on public.poets
  for insert to authenticated
  with check (public.is_staff());

-- update restricted to moderator/admin
create policy "poets_update_staff" on public.poets
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- delete restricted to moderator/admin (curated-registry cleanup)
create policy "poets_delete_staff" on public.poets
  for delete to authenticated
  using (public.is_staff());

-- -----------------------------------------------------------------------------
-- poet_requests
-- -----------------------------------------------------------------------------
-- users can read only their own requests
create policy "poet_requests_select_own" on public.poet_requests
  for select to authenticated
  using (auth.uid() = requested_by);

-- users can insert their own requests
create policy "poet_requests_insert_own" on public.poet_requests
  for insert to authenticated
  with check (auth.uid() = requested_by);

-- moderators/admins can read all requests
create policy "poet_requests_select_staff_all" on public.poet_requests
  for select to authenticated
  using (public.is_staff());

-- moderators/admins can update all requests
create policy "poet_requests_update_staff_all" on public.poet_requests
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- poem_submissions
-- -----------------------------------------------------------------------------
-- users can read only their own submissions (to track status)
create policy "poem_submissions_select_own" on public.poem_submissions
  for select to authenticated
  using (auth.uid() = submitted_by);

-- users can insert their own submissions
create policy "poem_submissions_insert_own" on public.poem_submissions
  for insert to authenticated
  with check (auth.uid() = submitted_by);

-- moderators/admins can read all submissions
create policy "poem_submissions_select_staff_all" on public.poem_submissions
  for select to authenticated
  using (public.is_staff());

-- moderators/admins can update all submissions (approve/reject/review)
create policy "poem_submissions_update_staff_all" on public.poem_submissions
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- poems
-- -----------------------------------------------------------------------------
-- public read of non-disputed poems
create policy "poems_select_public" on public.poems
  for select to anon, authenticated
  using (attribution_status <> 'disputed');

-- disputed poems visible only to moderators/admins
create policy "poems_select_staff_all" on public.poems
  for select to authenticated
  using (public.is_staff());

-- insert is intentionally NOT granted to any role: rows are written only by
-- the security-definer approve_poem_submission() function triggered by
-- moderator approval. Nothing here to create — absence of an insert policy
-- blocks direct writes from anon/authenticated.

-- moderators/admins may update poems directly (change attribution_status to
-- verified/disputed, etc.) — regular users can never write poems.
create policy "poems_update_staff" on public.poems
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- favorites
-- -----------------------------------------------------------------------------
-- users can read only their own favorites
create policy "favorites_select_own" on public.favorites
  for select to authenticated
  using (auth.uid() = user_id);

-- users can insert their own favorites
create policy "favorites_insert_own" on public.favorites
  for insert to authenticated
  with check (auth.uid() = user_id);

-- users can delete their own favorites
create policy "favorites_delete_own" on public.favorites
  for delete to authenticated
  using (auth.uid() = user_id);

-- -----------------------------------------------------------------------------
-- reports
-- -----------------------------------------------------------------------------
-- any authenticated user can insert a report
create policy "reports_insert_authenticated" on public.reports
  for insert to authenticated
  with check (auth.role() = 'authenticated');

-- read restricted to moderator/admin
create policy "reports_select_staff" on public.reports
  for select to authenticated
  using (public.is_staff());

-- update restricted to moderator/admin (resolve, mark disputed, etc.)
create policy "reports_update_staff" on public.reports
  for update to authenticated
  using (public.is_staff())
  with check (public.is_staff());

-- -----------------------------------------------------------------------------
-- grants
-- -----------------------------------------------------------------------------
grant usage on schema public to anon, authenticated, service_role;

-- profiles: only authenticated users read/update profiles (RLS filters rows)
grant select, update on public.profiles to authenticated;
grant select, update on public.profiles to service_role;

-- poets: public read; writes gated entirely by RLS (staff only)
grant select on public.poets to anon;
grant select, insert, update, delete on public.poets to authenticated;
grant select, insert, update, delete on public.poets to service_role;

-- poet_requests: only authenticated users interact (own rows via RLS)
grant select, insert, update on public.poet_requests to authenticated;
grant select, insert, update, delete on public.poet_requests to service_role;

-- poem_submissions: only authenticated users interact (own rows via RLS)
grant select, insert, update on public.poem_submissions to authenticated;
grant select, insert, update, delete on public.poem_submissions to service_role;

-- poems: public read of non-disputed; staff may update attribution_status.
-- INSERT is deliberately withheld from anon/authenticated — new poems are
-- created only by the security-definer approve_poem_submission() function.
grant select on public.poems to anon;
grant select, update on public.poems to authenticated;
grant select, insert, update, delete on public.poems to service_role;

-- favorites: only authenticated users interact (own rows via RLS)
grant select, insert, delete on public.favorites to authenticated;
grant select, insert, update, delete on public.favorites to service_role;

-- reports: any authenticated user inserts; staff read/update (RLS gates this)
grant select, insert, update on public.reports to authenticated;
grant select, insert, update, delete on public.reports to service_role;

commit;