"use client";

import { PoemSubmissionForm } from "./poem-submission-form";
import type { PoetResult } from "@/app/actions";
import { type CategorySelectRecord } from "./category-select";

/**
 * "This is my own poem" on /submit — thin wrapper around the shared
 * PoemSubmissionForm. The attribution is the submitter's own linked poet
 * record (not editable) and `source` is the fixed bilingual "Personal
 * knowledge" constant rendered as a disabled input paired with a hidden input.
 * When editing an existing pending submission the same rules apply, which is
 * why the two flows share one component.
 */
export function OwnPoemForm({
  poetId,
  categories,
  lockedPoet = null,
}: {
  poetId: string;
  categories: CategorySelectRecord[];
  /** Optional display-only poet; the id always comes from `poetId`. */
  lockedPoet?: PoetResult | null;
}) {
  return (
    <PoemSubmissionForm
      categories={categories}
      path="own"
      lockedPoetId={poetId}
      lockedPoet={lockedPoet}
    />
  );
}
