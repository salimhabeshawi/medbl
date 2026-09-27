"use client";

import { useTranslations } from "next-intl";

/**
 * The small filled circle on the Moderation nav link, shown when
 * pending_submissions + open_reports > 0 (see getModerationPendingCounts in
 * lib/moderation.ts and the get_moderation_pending_counts() RPC).
 *
 * Presence only, no count: the dot answers "is there anything to review",
 * while the exact totals live on /moderate. There is no seen/unseen tracking,
 * so it simply mirrors current totals and keeps showing while work remains —
 * including after the moderator has already opened /moderate.
 *
 * The circle itself is aria-hidden (pure decoration); the accompanying
 * screen-reader text is what actually conveys the state, so the indicator
 * isn't colour-only. Wording lives in the `Nav` namespace and is translated.
 */
export function ModerationDot() {
  const tNav = useTranslations("Nav");

  return (
    <>
      <span
        aria-hidden="true"
        className="size-1.5 shrink-0 rounded-full bg-destructive align-middle"
      />
      <span className="sr-only">{tNav("moderationPending")}</span>
    </>
  );
}