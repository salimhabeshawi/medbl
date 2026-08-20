# AGENTS.md — medbl

Amharic poetry community platform, modeled on aldiwan.net. This file is
context for any AI coding agent working in this repo. Follow it exactly —
do not substitute simpler defaults for the rules below, even if they'd be
faster to implement.

## Project summary

A site where:
- Visitors browse poems by poet, category, or search.
- Registered users can favorite poems.
- Registered users can submit poems, but every poem MUST be linked to a
  real, existing poet record — never a free-text name.
- Poets are a curated registry, not something users create ad hoc.
- All community submissions are moderated before becoming public.

## Tech stack (do not deviate)

- Frontend: Next.js (App Router), TypeScript, Tailwind CSS
- Backend: Supabase (Postgres + Auth + Storage), free tier
- Hosting: Vercel (frontend), Supabase (backend) — both free tier
- Fonts: Noto Sans Ethiopic (or equivalent full Ethiopic Unicode coverage)
  for all Amharic text rendering
- Search: Postgres trigram / full-text search via Supabase — no external
  search service

## Data model

### `poets`
Curated registry. NOT freely insertable by regular users.
- `id`
- `name_am` (Amharic name)
- `name_en` (transliteration, optional but recommended for search/URLs)
- `bio`
- `birth_year`, `death_year` (nullable — needed for public-domain checks)
- `verified` (bool) — set by moderator/admin only
- `created_by` (user id, nullable — null if seeded by admin)
- `created_at`

### `poet_requests`
When a user wants to add a poet who isn't in the registry yet.
- `id`
- `requested_by` (user id)
- `name_am`, `name_en`, `bio`, supporting info / source link
- `status`: `pending` | `approved` | `rejected`
- `reviewed_by` (moderator id, nullable)
- `created_at`

On approval, a moderator (or an admin action) creates the corresponding
`poets` row — this is a manual promotion step, not automatic.

### `poem_submissions`
Where all new poems land first. Nothing here is public.
- `id`
- `submitted_by` (user id)
- `poet_id` (foreign key to an EXISTING `poets` row — required, not
  nullable, not free text)
- `title`
- `body` (full poem text)
- `category` / `tags`
- `source` (required free-text field: where the submitter got this poem —
  book, website, personal knowledge, oral tradition, etc.)
- `status`: `pending` | `approved` | `rejected`
- `reviewed_by` (moderator id, nullable)
- `rejection_reason` (nullable)
- `created_at`

### `poems`
Public, published poems only. Populated by promoting an approved
`poem_submissions` row — never written to directly by end users.
- `id`
- `poet_id` (foreign key to `poets`)
- `title`
- `body`
- `category` / `tags`
- `attribution_status`: `verified` | `community` | `disputed`
  - `verified` = moderator confirmed against a reliable source
  - `community` = accepted but not independently verified (default for
    most approved submissions)
  - `disputed` = flagged via a report, hidden from default browse/search
    until resolved
- `source` (carried over from submission)
- `submitted_by` (user id, for attribution/history)
- `created_at`

### `favorites`
- `id`
- `user_id`
- `poem_id`
- `created_at`
- unique constraint on (`user_id`, `poem_id`)

### `reports`
Flags on published poems — wrong attribution, copyright claim, etc.
- `id`
- `poem_id`
- `reported_by` (user id, nullable if unauthenticated report form is
  allowed)
- `reason`
- `status`: `open` | `resolved`
- `resolved_by` (moderator id, nullable)
- `created_at`

### `users` / roles
Use Supabase Auth for the base `users` table. Add a `role` column
(`member` | `moderator` | `admin`) via a `profiles` table keyed on the
auth user id. Default role on signup: `member`.

## Row-Level Security (RLS) — required, not optional

This is the most important section. Do not ship without these:

- `poets`: public read. Insert/update restricted to `moderator`/`admin`
  roles only.
- `poet_requests`: users can insert their own, and read only their own.
  Moderators/admins can read and update all.
- `poem_submissions`: users can insert their own, and read only their
  own (so they can track status). Moderators/admins can read and update
  all.
- `poems`: public read where `attribution_status != 'disputed'`.
  Disputed poems visible only to moderators/admins. Insert/update
  restricted to a server-side function triggered by moderator approval —
  never directly writable by regular users.
- `favorites`: users can insert/delete/read only their own rows.
- `reports`: any authenticated user can insert. Read/update restricted
  to `moderator`/`admin`.

## Moderation workflow

1. User submits a poem → row in `poem_submissions`, status `pending`.
2. Moderator reviews: checks the poet link is correct, checks `source`,
   checks the poem isn't already in the system.
3. Moderator approves → a new row is created in `poems` (attribution
   status `community` by default, or `verified` if the moderator
   confirmed against a solid source) and `poem_submissions.status` is
   set to `approved`.
4. Moderator rejects → `poem_submissions.status` set to `rejected`,
   `rejection_reason` filled in, nothing is published.
5. Same pending → approved/rejected flow applies to `poet_requests`.
6. Any published poem can later be `reports`-flagged by any user; enough
   reports (or one moderator review) can move `attribution_status` to
   `disputed`, which hides it from public browse/search until resolved.

## Copyright / rights notes for the agent

- Do not build any feature that lets users bulk-import poem text from
  external sites via scraping — this is a legal risk, not just a
  technical one.
- The `source` field on submissions and the `reports` mechanism exist
  specifically to give the project a defensible moderation and takedown
  trail. Don't remove or make them optional.

## Build order (suggested)

1. Next.js + Tailwind scaffold, basic layout, Noto Sans Ethiopic font
   loaded.
2. Supabase project, schema above, RLS policies above.
3. Supabase Auth wired into Next.js (signup/login).
4. Public browse/search pages (poets, poems, categories) — read-only,
   no auth required.
5. Favorites (requires auth).
6. Poem submission flow (poet search-and-select, not free text).
7. Poet request flow.
8. Moderator dashboard (approve/reject submissions and poet requests,
   resolve reports).
9. Reports/flagging UI on poem pages.

Do not skip ahead to submission/moderation UI before RLS policies are in
place — that ordering is intentional.
