"use client";

import { PoemSubmissionForm } from "./poem-submission-form";
import type { PoetResult } from "@/app/actions";
import { type CategorySelectRecord } from "./category-select";

/**
 * "This is another poet's poem" on /submit — thin wrapper around the shared
 * PoemSubmissionForm. That component owns the field set, the mandatory category
 * rule and the poet/proposed-poet handling, and the very same component backs
 * the pending-submission edit form on /my-submissions, so creating and editing
 * can never drift apart.
 */
export function SubmitPoemForm({
  categories,
  defaultPoet = null,
}: {
  categories: CategorySelectRecord[];
  /**
   * Poet pre-selected when the form loads. Today this is always the seeded
   * "Folk poetry" poet (looked up by `name_en = 'Folk poetry'` in the page),
   * used as the default attribution for poems of unknown authorship. The user
   * can pick any other poet instead — including proposing a new one — and that
   * simply replaces this default.
   */
  defaultPoet?: PoetResult | null;
}) {
  return (
    <PoemSubmissionForm
      categories={categories}
      path="other"
      defaultPoet={defaultPoet}
    />
  );
}
