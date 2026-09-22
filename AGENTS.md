# AGENTS.md — medbl

Amharic poetry community platform, modeled on aldiwan.net. This file is
context for any AI coding agent working in this repo. Follow it exactly —
do not substitute simpler defaults for the rules below, even if they'd be
faster to implement. This file supersedes any earlier version — it
reflects the CURRENT state of the app, not the original plan.

## Project summary

A site where:

- Visitors browse poems by poet or category, and search across titles,
  bodies, tags, poet names, and category names.
- Registered users can favorite poems, submit poems, and track their own
  submissions' review status.
- Registered users submit poems — either their OWN poems (they are the
  poet) or another poet's poem.
- Every poem is always linked to a real poet record — never a free-text
  name with no backing record.
- Poets are either: (a) linked to a user's own profile when they fill in
  their poet details on `/profile`, or (b) proposed inline during poem
  submission and created by a moderator on approval.
- All community-submitted poems are moderated before becoming public.
  A poem being self-linked to the submitter's own poet record does NOT
  mean auto-publish — it still goes through the same moderation queue.
- The UI is fully bilingual (Amharic default, English opt-in). Category
  names are bilingual in the database; user-generated content is never
  translated.

## Tech stack (do not deviate)

- Frontend: Next.js 16 (App Router, Turbopack dev), TypeScript, Tailwind
  CSS v4
- UI components: shadcn/ui (Radix-based), lucide-react icons, sonner
  toasts, next-themes (light/dark toggle)
- Backend: Supabase (Postgres + Auth + Storage), free tier
- Hosting: Vercel (frontend), Supabase (backend) — both free tier, live
  in production
- Fonts: Noto Sans Ethiopic, Lora, Inter (all via next/font/google,
  variables set in the root layout — do not override per-component)
- Search: Postgres trigram (pg_trgm) / ilike via the `search_poems()`
  RPC — no external search service
- i18n: next-intl v4 (cookie-based locale, no URL routing) — see the
  "Internationalization" section below
- PWA: installable (app/manifest.ts + install prompt component)
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
  actions, error states, the "disputed" tag

**Typography:**

- Amharic text: **Noto Sans Ethiopic** (configured via next/font/google
  as `--font-noto-ethiopic`) — always used for any Amharic content,
  never overridden per-component.
- Latin headings: **Lora** (serif, `--font-lora`)
- Latin body/UI text: **Inter** (sans, `--font-inter`)

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

## Internationalization (next-intl)

- Locales: `am` (default) and `en`. The active locale is stored ONLY in
  the `NEXT_LOCALE` cookie — there is no locale prefix in URLs and no
  `[locale]` route segment.
- `i18n/request.ts` (`getRequestConfig`) reads the cookie, validates it
  against `["am", "en"]`, falls back to `am`, and loads the matching
  dictionary from `messages/am.json` / `messages/en.json`. It also sets
  a global `timeZone: "Africa/Addis_Ababa"` so date/time formatting is
  deterministic between server and client.
- `next.config.ts` wires this up via `createNextIntlPlugin("./i18n/request.ts")`.
- The middleware (`proxy.ts`) does NOT do locale negotiation; it only
  refreshes the Supabase auth session (see below). next-intl needs no
  routing middleware under this cookie-based strategy.
- A `LanguageToggle` in the header flips the cookie and refreshes.
- Category labels use the selected UI locale with fallback to the other
  non-null name. User-generated content is never translated: poem titles,
  bodies, tags, poet names and bios, sources, rejection reasons, and report
  reasons are displayed exactly as stored.

## Data model (current)

Enums: `user_role`, `request_status`, `attribution_status`,
`report_status`. Helper SQL functions `get_my_role()`, `is_staff()`,
`is_admin()` (security definer) are used by RLS policies throughout.

### `profiles`

One row per Supabase Auth user, created automatically via the
`handle_new_user()` trigger on `auth.users` insert. An `updated_at`
maintenance trigger (`set_updated_at`) keeps `updated_at` current.

- `id` (= auth.users.id)
- `role`: `member` | `moderator` | `admin`, default `member`
- `poet_id` (nullable FK to `poets`, unique, `on delete set null`) —
  this user's own linked poet record. Null until the user fills in and
  saves their poet details on `/profile` (see below).
- `created_at`, `updated_at`

### `poets`

Registry of poets. A poet row can originate from three paths:

1. Seeded/created directly by an admin/moderator.
2. Created via `upsert_my_poet_profile()` when a user saves their poet
   details on `/profile` (`created_by` = that user, `verified` = false).
3. Created by a moderator on approval of a poem submission that
   proposed a new poet (`created_by` = the submitter, `verified` =
   false).

- `id`
- `name_am` (Amharic name, required)
- `name_en` (transliteration, optional)
- `bio`
- `birth_year` (nullable integer; both the profile form and
  `upsert_my_poet_profile()` handle only birth year, no death year)
- `verified` (bool) — only set true by a moderator/admin action
- `created_by` (user id, nullable)
- `created_at`
- GIN trigram indexes on `name_am` and `name_en` for fuzzy matching
  (used by `match_poets()` and search).

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
- `title`, `body`, `tags`
- `category_id` (nullable FK to `categories`) — set on insert from the
  category picker
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
- `poem_number` (integer, not null, unique) — system-assigned sequential
  number displayed as "#N" on poem cards and the poem page. Backed by the
  dedicated sequence `poems_poem_number_seq` (column default `nextval`), so
  every INSERT — which only happens via `approve_poem_submission()` — gets
  the next number automatically, in approval/publish order. Existing rows
  were backfilled by `created_at asc, id asc`; the sequence was then
  advanced past the max. Never included in any client INSERT/UPDATE payload
  and never editable by users or moderators.
- `poet_id` (FK to `poets`, required)
- `title`, `body`, `tags`
- `category_id` (nullable FK to `categories`)
- `attribution_status`: `verified` | `community` | `disputed`
- `source`, `submitted_by` (nullable)
- `created_at`
- GIN trigram indexes on `title` and `body` for search.

### `categories` (bilingual registry)

- `id` (uuid primary key, default `gen_random_uuid()`)
- `name_en` (text, unique, not null)
- `name_am` (nullable text)
- `created_by` (nullable auth user id), `created_at`
- Seeded with seven bilingual categories: Love/ፍቅር, Culture/ባህል,
  Nature/ተፈጥሮ, Spirituality/መንፈሳዊነት, Society/ህብረተሰብ,
  History/ታሪክ, Contemporary/ዘመናዊ.
- `poems.category_id` and `poem_submissions.category_id` are nullable
  FKs to `categories.id` (`on delete set null`). The original plain-text
  `category` columns were dropped after backfilling (the backfill fails
  loudly on unmatched values rather than discarding them).
- Deleting a category is done exclusively through the security-definer
  `delete_category(p_category_id)`, which refuses while any poem or
  submission still references the category.

### `favorites`

- `id`, `user_id`, `poem_id`, `created_at`
- unique (`user_id`, `poem_id`)

### `reports`

- `id`, `poem_id`, `reported_by` (nullable), `reason`
- `status`: `open` | `resolved`
- `resolved_by` (nullable), `created_at`
- `former_attribution_status` (nullable) — remembers the pre-dispute
  tag so "Republish" can restore it exactly
- Partial unique index `reports_open_poem_reporter_key` on
  (`poem_id`, `reported_by`) WHERE `status = 'open'` — at most one open
  report per poem per reporter; a resolved report never blocks a
  legitimate re-report.

### Removed: `poet_requests`

This table existed early on as a standalone "request a new poet"
feature, decoupled from poem submission. It has been REMOVED. Do not
recreate it. Proposing a new poet only happens inline as part of a poem
submission (another-poet path), or via a user linking their own poet
profile on `/profile`.

## Database functions (RPC surface)

All security-definer functions carry an explicit authorization check
inside and are revoked from `public` / granted to specific roles.

- `search_poems(p_query, p_limit)` — trigram/ILIKE search over title,
  body, tags, poet names, and both category name columns. Excludes
  disputed poems. Public.
- `get_featured_poems(p_limit)` — most-favorited non-disputed poems
  with favorite counts. Public.
- `get_poem_favorite_counts(p_poem_ids uuid[])` — per-poem favorite
  counts for cards (input ids are deduplicated to avoid double
  counting). Public.
- `get_featured_poets(p_limit)` — ranked poets: poem output + total
  likes, log-scaled (40/60 weights), plus `liked_poem_count` (poems
  with ≥ 1 favorite) and a log-scale `favorites_per_poem_percent`.
  Disputed poems excluded. Public.
- `approve_poem_submission(p_submission_id, p_attribution_status,
  p_poet_id)` — staff-only; resolves the poet (explicit choice →
  proposed new poet → submission's own poet_id), inserts into `poems`
  (copying `category_id`), marks the submission approved.
- `upsert_my_poet_profile(p_name_am, p_name_en, p_birth_year, p_bio)` —
  authenticated users; creates or updates the caller's own poet record
  (matched by `created_by`, oldest wins) and links it on
  `profiles.poet_id`. Self-heals a missing profiles row; fails loudly
  if linking is impossible.
- `match_poets(p_name)` — top-3 existing poets similar to a proposed
  name (pg_trgm, session similarity threshold lowered to 0.2 for the
  lookup). Staff use.
- `has_open_report(p_poem_id)` — narrow security-definer answer to
  "has the caller already open-reported this poem?" (members cannot
  select from `reports` directly). Authenticated only.
- `delete_category(p_category_id)` — staff-only; refuses while the
  category is still referenced by a poem or submission.

## Row-Level Security — key points (do not weaken any of these)

- `poets`: public read. Insert/update/delete restricted to
  moderator/admin via RLS policy for direct access. The only way a
  regular user affects `poets` is indirectly, through the security
  definer function `upsert_my_poet_profile()`, which only ever touches
  the calling user's own linked poet row.
- `poem_submissions`: users read/insert only their own rows. Staff read
  and update all.
- `poems`: public read — ALL rows, including disputed ones (see
  "Disputed poems" below). NO insert grant for `anon`/`authenticated`
  at all — only `approve_poem_submission()` can create rows here.
  Staff-only update and delete policies.
- `favorites`: standard own-row policies for insert/read/delete.
  Aggregate counts reach the public only through the
  `get_poem_favorite_counts` / featured RPCs above.
- `reports`: any authenticated user can insert one; read/update are
  staff-only (that's why `has_open_report()` exists for the UI).
- `profiles`: users read/update their own row but cannot change their
  own `role`. Admins can update any profile. Staff can read all profiles.
- `categories`: public read; staff-only insert/delete (insert requires
  `created_by = auth.uid()`); no direct update for clients.

## Disputed poems (public flow — supersedes the old "hide" rule)

A disputed poem STAYS publicly readable everywhere; it is marked with a
red "disputed" tag (a UI concern) instead of disappearing from
browse/search. Moderators, from a report card, can:

- **Republish** — restore `attribution_status` from
  `reports.former_attribution_status` (verified or community).
- **Remove permanently** — delete the poem (cascades to its favorites
  and reports via FKs).

## Copyright / rights notes for the agent

- Do not build any feature that lets users bulk-import poem text from
  external sites via scraping — legal risk, not just technical.
- The `source` field on submissions and the `reports` mechanism exist
  specifically to give the project a defensible moderation and takedown
  trail. Don't remove or make them optional.

## Pages / routes (current)

- `/` — home: featured poets (`get_featured_poets`), featured poems
  (`get_featured_poems`), recent poems, with favorite counts.
- `/poems`, `/poems/[id]` — poem browse and detail. The poem page hosts
  favorite toggle, report dialog, and the disputed tag when applicable.
- `/poets`, `/poets/[id]` — poet directory and poet detail (their
  published poems).
- `/favorites` — the signed-in user's favorited poems (redirects to
  `/login` when signed out).
- `/submit` — poem submission entry point (see flow below).
- `/my-submissions` — the signed-in user's submissions with status
  badges (pending / approved / rejected + reason). Redirects to
  `/login` when signed out.
- `/profile` — poet details + account settings (see below).
- `/login`, `/signup` — minimal auth forms + Google OAuth button.
- `/auth/callback` — OAuth code-exchange route handler.
- `/moderate` — staff dashboard overview (pending/open counts +
  category manager).
- `/moderate/submissions` — review queue; inline poem/proposed-poet
  editing, fuzzy poet matching, approve/reject.
- `/moderate/reports` — resolve reports; dispute / republish / remove
  poem actions.
- `/terms`, `/privacy` — legal pages, linked from footer/signup/submit.
- `app/manifest.ts` — PWA web manifest (installable app;
  `install-app-prompt.tsx` shows the install banner).

There is no standalone `/categories` or `/search` page: search is the
`UniversalSearch` component in the header (calls `search_poems`), and
category administration lives on `/moderate`.

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
   `pg_trgm` similarity (`match_poets()`). Moderator can pick a match
   or proceed with creating the new poet as proposed.
4. Moderator can edit poem fields and proposed-poet fields inline
   before approving.
5. Approval calls `approve_poem_submission(p_submission_id,
p_attribution_status, p_poet_id)` — resolves poet_id (provided,
   newly created from proposed fields, or the submission's own),
   inserts into `poems` (copying `category_id`), marks the submission
   `approved`.
6. Rejection: `status = 'rejected'` with a required `rejection_reason`.
7. `poet_requests` and `/poets/request` do not exist.
8. Reports: any authenticated user can file one from a poem's page
   (duplicate open reports by the same user on the same poem are
   blocked at the DB level). Moderators resolve them from
   `/moderate/reports` and can dispute → republish or remove the poem
   (see "Disputed poems").
9. Categories: staff manage the bilingual category registry from
   `/moderate` (`CategoryManager` component); deletion goes through
   `delete_category()` and is blocked while still referenced.

## Auth session middleware

`proxy.ts` (Next.js middleware) does exactly one thing: call
`updateSession()` from `lib/supabase/middleware.ts`, which refreshes
the Supabase auth cookies on every matched request. Locale detection is
NOT in middleware — it's cookie-based inside `i18n/request.ts`.

## TypeScript / project config notes

- Path alias `@/*` maps to the repo root.
- `tsconfig.json`'s `exclude` array contains ONLY `node_modules` —
  there is no explicit exclusion for `supabase/`. The Deno edge-function
  scaffold under `supabase/functions/` (a single `test` function
  registered in `supabase/config.toml`) is Deno code outside the
  Next.js build pipeline, so it simply never enters the app's TS
  compilation unit.
- `app/actions.ts` holds the server actions used by the client forms
  (submission, profile, moderation actions, report resolution).
- `lib/` helpers: `lib/supabase/` (browser/server clients + middleware
  session refresh), `lib/favorites.ts`, `lib/moderation.ts`,
  `lib/relations.ts`.

## Build order — completed so far

1. Next.js + Tailwind scaffold, layout, fonts — done
2. Supabase schema + RLS (profiles, poets, poem_submissions, poems,
   favorites, reports; auth trigger; role helpers) — done
3. Supabase Auth (email/password + Google OAuth) + session-refresh
   middleware — done
4. Public browse pages (poets, poems) + poem detail — done
5. Favorites (own-row RLS, favorite toggle UI, `/favorites` page) —
   done
6. Report/flagging UI + cross-session dedup (partial unique index,
   `has_open_report()` RPC) — done
7. Moderator dashboard (submissions queue, reports) — done
8. Disputed-poem public flow (stays visible with red tag; republish
   via `former_attribution_status`; staff poem delete) — done
9. Poet proposal merged inline into submissions (`poet_requests`
   dropped; `match_poets()` fuzzy matching) — done
10. `/profile` page (poet details + account settings) + the "my own
    poem" redirect-to-complete-profile flow (`upsert_my_poet_profile()`
    incl. self-healing profile link) — done
11. Universal poem search (`search_poems()` + header search component)
    — done
12. Featured poets/poems RPCs + favorite counts — done (iterated:
    log-scale scoring, `liked_poem_count`, dedup + numeric-cast fixes)
13. Bilingual categories registry (`categories` table, FK-based
    `category_id` on poems/submissions, category manager, staff delete
    guard) — done
14. Full UI rebuild with shadcn/ui, mobile-first, hamburger nav, theme
    toggle — done
15. Terms of Service and Privacy Policy pages, linked from
    footer/signup/submit — done
16. Amharic/English UI translation (next-intl, cookie-based,
    `Africa/Addis_Ababa` formatting zone) — done
17. PWA manifest + install prompt — done
18. Deployed to Vercel + Supabase, live — done
19. Sequential human-facing poem numbers (`poems.poem_number` with dedicated
    sequence, publish-order backfill, "#N" on poem cards + poem page;
    `get_featured_poems` returns the number) — done

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
