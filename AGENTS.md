# AGENTS.md — medbl

Amharic poetry community platform, modeled on aldiwan.net. This file is
context for any AI coding agent working in this repo. Follow it exactly —
do not substitute simpler defaults for the rules below, even if they'd be
faster to implement. This file supersedes any earlier version — it
reflects the CURRENT state of the app, not the original plan.

## Project summary

A site where:
- Visitors browse poems by poet, category, or search.
- Registered users can favorite poems.
- Registered users can submit poems — either their OWN poems (they are
  the poet) or another poet's poem.
- Every poem is always linked to a real poet record — never a free-text
  name with no backing record.
- Poets are either: (a) linked to a user's own profile when they fill in
  their poet details on `/profile` (see below), or (b) proposed inline
  during poem submission and created by a moderator on approval.
- All community-submitted poems are moderated before becoming public.
  A poem being self-linked to the submitter's own poet record does NOT
  mean auto-publish — it still goes through the same moderation queue.

## Tech stack (do not deviate)

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- UI components: shadcn/ui, built on top of Tailwind — see "Design
  system" below for tokens/fonts
- Backend: Supabase (Postgres + Auth + Storage), free tier
- Hosting: Vercel (frontend), Supabase (backend) — both free tier, live
  in production
- Fonts: Noto Sans Ethiopic (via next/font/google), set as default body
  font in the root layout — do not override per-component
- Search: Postgres trigram (pg_trgm) / ilike search via Supabase — no
  external search service
- Auth: Supabase Auth via @supabase/ssr (email/password + Google OAuth),
  with browser + server client utilities and session-refresh middleware
  already in place

## Design system

Visual direction: **warm & traditional** — earthy, parchment/manuscript
feel, not a generic gray SaaS dashboard look. Any new UI work must use
these tokens, not shadcn's default gray theme.

**Colors** (define as CSS variables in globals.css, wired into
Tailwind/shadcn theme config — do not hardcode hex values inline in
components):
- Background: `#FBF3E6` (warm parchment cream)
- Foreground/text: `#2E2018` (deep coffee brown)
- Primary: `#B5651D` (burnt terracotta/ochre) — primary buttons, links,
  active nav states
- Secondary: `#5B6B3F` (muted olive green) — secondary actions, badges
  (e.g. "verified" attribution badge)
- Muted/border: `#D9C7AC` (warm tan)
- Destructive: `#8B3A3A` (muted brick red) — reject/delete/report
  actions, error states

**Typography:**
- Amharic text: **Noto Sans Ethiopic** (already configured via
  next/font/google) — always used for any Amharic content, never
  overridden per-component.
- Latin headings: **Lora** (serif)
- Latin body/UI text: **Inter** (sans)

**Layout principle: mobile-first.** Write base (unprefixed) Tailwind
classes for the smallest viewport first, then layer on `sm:`/`md:`/
`lg:` overrides for larger screens — never the reverse. Navigation uses
a hamburger menu (shadcn `Sheet` component) below the `md` breakpoint,
switching to a horizontal nav bar at `md` and above.

**Component library usage:** use shadcn/ui components (Button, Input,
Textarea, Label, Card, Dialog, Sheet, DropdownMenu, Avatar, Badge, Tabs,
Select, Alert, Skeleton, Separator, Sonner for toasts) rather than
hand-rolled equivalents, so the app stays visually consistent as new
features are added. Install additional shadcn components as needed
rather than building custom versions of things shadcn already provides.

## Signup / login — keep these simple, always

Signup and login collect ONLY email and password (plus the Google OAuth
option as an alternative sign-in method — this doesn't count as "adding
a field", it's a separate button). Do not add poet fields, profile
fields, or any other input fields to signup or login, ever. Anything
related to "who is this user as a poet" belongs exclusively on
`/profile`, filled in after signup, only if and when the user actually
wants to submit their own poem.

The `handle_new_user()` trigger on `auth.users` only creates a
`profiles` row (`role` default `member`, `poet_id` null). It fires
identically regardless of sign-in method (email/password or Google).
Do not change this.

## Data model (current)

### `profiles`
One row per Supabase Auth user, created automatically via the
`handle_new_user()` trigger on `auth.users` insert.
- `id` (= auth.users.id)
- `role`: `member` | `moderator` | `admin`, default `member`
- `poet_id` (nullable FK to `poets`, unique) — this user's own linked
  poet record. Null until the user fills in and saves their poet
  details on `/profile`. See "Profile page" below.
- `created_at`, `updated_at`

### `poets`
Registry of poets. A poet row can originate from three paths:
1. Seeded/created directly by an admin/moderator.
2. Created via the `upsert_my_poet_profile()` function when a user
   saves their poet details on `/profile` (`created_by` = that user,
   `verified` = false).
3. Created by a moderator on approval of a poem submission that
   proposed a new poet (`created_by` = the submitter, `verified` =
   false).
- `id`
- `name_am` (Amharic name, required)
- `name_en` (transliteration, optional)
- `bio`
- `birth_year`, `death_year` (nullable integers)
- `verified` (bool) — only set true by a moderator/admin action
- `created_by` (user id, nullable)
- `created_at`
- trigram index on `name_am` (and `name_en` if present) for fuzzy
  matching — see moderation workflow below

### `poem_submissions`
Where all new poems land first. Nothing here is public until approved.
- `id`
- `submitted_by` (user id)
- `poet_id` (nullable FK to `poets`) — set when the poem is linked to
  an existing poet (including the submitter's own linked poet record
  for "this is my poem" submissions)
- `proposed_poet_name_am`, `proposed_poet_name_en`, `proposed_poet_bio`
  (nullable) — set instead of `poet_id` when the submitter is proposing
  a brand-new poet inline as part of this submission (only used on the
  "another poet's poem" path — never on the "my own poem" path)
- Exactly one of `poet_id` or `proposed_poet_name_am` must be set —
  enforced by a check constraint (`poem_submissions_poet_xor`)
- `title`, `body`, `category`, `tags`
- `source` (required — provenance of the poem; also doubles as
  provenance for a proposed poet, if applicable)
- `status`: `pending` | `approved` | `rejected`
- `reviewed_by`, `rejection_reason` (nullable)
- `created_at`

### `poems`
Public, published poems only. Rows are created EXCLUSIVELY by the
`approve_poem_submission()` function — there is no INSERT grant for
`anon`/`authenticated` on this table, not even gated by a policy; the
grant itself is withheld.
- `id`
- `poet_id` (FK to `poets`, required)
- `title`, `body`, `category`, `tags`
- `attribution_status`: `verified` | `community` | `disputed`
- `source`, `submitted_by` (nullable)
- `created_at`

### `favorites`
- `id`, `user_id`, `poem_id`, `created_at`
- unique (`user_id`, `poem_id`)

### `reports`
- `id`, `poem_id`, `reported_by` (nullable), `reason`
- `status`: `open` | `resolved`
- `resolved_by` (nullable), `created_at`

### Removed: `poet_requests`
This table existed early on as a standalone "request a new poet"
feature, decoupled from poem submission. It has been REMOVED. Do not
recreate it. Proposing a new poet only happens inline as part of a
poem submission (another-poet path), or via a user linking their own
poet profile on `/profile`.

## Profile page (`/profile`)

Requires auth (redirect to `/login` if not logged in). Two independent
sections:

**1. Poet details** — name_am (required to save), name_en, birth_year,
bio (all optional except name_am). Prefilled from the user's linked
`poets` row if `profiles.poet_id` is set, otherwise blank. Saving calls
`upsert_my_poet_profile(...)` (security definer function), which
creates the poet row and links it on first save, or updates the
existing linked poet row on subsequent saves.

**2. Account settings** — change email, change password.
- Email change: `supabase.auth.updateUser({ email })`. Supabase's
  default behavior sends a confirmation link to both current and new
  email — rely on this, don't build a custom flow.
- Password change: uses the **current-password confirmation** method
  (not the reauthentication/nonce method):
  ```
  supabase.auth.updateUser({
    password: newPassword,
    current_password: currentPassword
  })
  ```
  This requires "Require current password when changing password" to
  be enabled in Supabase Auth settings (Authentication → Sign In /
  Providers → Email) — already enabled in this project.

**Redirect-after-save behavior:** every link/button that sends a user
to `/profile` must append a `redirect` query param set to where they
should return to after saving. The only case where `redirect` points
at the "submit my own poem" flow is when the user was sent to `/profile`
specifically because they tried to submit their own poem without a
poet profile set up yet. Saving account settings does not trigger this
redirect — the user stays on `/profile`.

## Poem submission flow (current)

`/submit` is the ONLY entry point for adding a poem. On landing, the
user chooses one of two paths:

**1. "This is my own poem"**
- If `profiles.poet_id` is set: no poet fields shown — proceed straight
  to poem fields (title, body, category/tags, source), using that
  `poet_id`.
- If null: redirect to `/profile?redirect=...` with a message
  explaining they need to set up their poet profile first. Once saved,
  they're sent back to finish the submission.

**2. "This is another poet's poem"**
- Search-and-select an existing poet by name, or expand the inline
  "didn't find the poet? add details" form to propose a new one
  (populates `proposed_poet_name_am`/`name_en`/`bio` instead of
  `poet_id`). Never touches the user's own profile.

Either path inserts one row into `poem_submissions` with `status =
'pending'`. Self-submitted poems are NOT auto-approved.

## Moderation workflow (current)

1. Submission appears in `/moderate/submissions` with status `pending`.
2. If `poet_id` is already set: moderator reviews poem content/source
   and approves or rejects. No poet resolution needed.
3. If `proposed_poet_name_am` is set: moderator sees it labeled "New
   poet proposed", plus the top 3 existing poets most similar by
   `pg_trgm` similarity on `name_am`. Moderator can pick a match or
   proceed with creating the new poet as proposed.
4. Moderator can edit poem fields and proposed-poet fields inline
   before approving.
5. Approval calls `approve_poem_submission(p_submission_id,
   p_attribution_status, p_poet_id)` — resolves poet_id (provided,
   newly created from proposed fields, or the submission's own),
   inserts into `poems`, marks the submission `approved`.
6. Rejection: `status = 'rejected'` with a required `rejection_reason`.
7. `poet_requests` and `/poets/request` do not exist.
8. Reports: any authenticated user can file one from a poem's page.
   Moderators resolve them and can set a poem's `attribution_status` to
   `disputed`, hiding it from public browse/search until resolved.

## Row-Level Security — key points (do not weaken any of these)

- `poets`: public read. Insert/update/delete restricted to
  moderator/admin via RLS policy for direct access. The only way a
  regular user affects `poets` is indirectly, through the security
  definer function `upsert_my_poet_profile()`, which only ever touches
  the calling user's own linked poet row.
- `poem_submissions`: users read/insert only their own rows. Staff read
  and update all.
- `poems`: public read where `attribution_status != 'disputed'`. NO
  insert grant for `anon`/`authenticated` at all — only
  `approve_poem_submission()` can create rows here.
- `favorites`, `reports`: standard own-row policies for
  insert/read/delete, staff-only read/update on `reports`.
- `profiles`: users read/update their own row but cannot change their
  own `role`. Admins can update any profile. Staff can read all profiles.

## Copyright / rights notes for the agent

- Do not build any feature that lets users bulk-import poem text from
  external sites via scraping — legal risk, not just technical.
- The `source` field on submissions and the `reports` mechanism exist
  specifically to give the project a defensible moderation and takedown
  trail. Don't remove or make them optional.

## Build order — completed so far

1. Next.js + Tailwind scaffold, layout, Noto Sans Ethiopic font — done
2. Supabase schema + RLS (all tables above) — done
3. Supabase Auth (email/password + Google OAuth) — done
4. Public browse/search pages (poets, poems, categories) — done
5. Favorites — done
6. Poem submission flow (merged, inline poet proposal + fuzzy match) — done
7. Moderator dashboard (submissions, poet resolution, reports) — done
8. Report/flagging UI on poem pages — done
9. Deployed to Vercel, live — done
10. `/profile` page (poet details + account settings) and the "my own
    poem" redirect-to-complete-profile flow — done
11. Google OAuth sign-in — done
12. Full UI rebuild with shadcn/ui, mobile-first, hamburger nav — done

## Guidelines for future changes

- Add new migrations as new files under `supabase/migrations/` — never
  edit a migration that's already been applied to the live database.
- Any new privileged database operation should be a `security definer`
  Postgres function with an explicit authorization check inside it,
  following the pattern of `approve_poem_submission()` and
  `upsert_my_poet_profile()`.
- Prefer withholding a GRANT entirely over relying only on an RLS
  policy when a table should never be writable by regular users at all.
- Keep signup/login minimal. Any future "collect more info about the
  user" idea belongs on `/profile`, opt-in, not on the signup form.
- Any new UI must follow the "Design system" section above — warm
  palette tokens, Lora/Inter/Noto Sans Ethiopic, mobile-first, shadcn
  components — not ad hoc styling.
- Keep this file in sync with reality at the end of every feature step
  — update the relevant section(s) above rather than appending a change
  log at the bottom.