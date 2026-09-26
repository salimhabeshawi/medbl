/**
 * Helpers for the in-list category/poet filters on /my-submissions and
 * /favorites. Both pages build their dropdown options from the rows the
 * signed-in user can actually see, so the filters only ever offer values
 * that appear in that user's own list — never the site-wide registries.
 */

export type ListFilterOption = {
  /** The `category_id` / `poet_id` the filter compares against. */
  id: string;
  /** Already localized display label (categories are bilingual). */
  label: string;
};

/**
 * De-duplicate and alphabetically sort per-row candidates into the option
 * list for a filter dropdown. Null entries (rows with no category / no
 * linked poet yet, e.g. pending proposed-poet submissions) are dropped.
 */
export function optionList(
  entries: (ListFilterOption | null)[],
): ListFilterOption[] {
  const seen = new Map<string, string>();
  for (const entry of entries) {
    if (entry && !seen.has(entry.id)) seen.set(entry.id, entry.label);
  }
  return [...seen.entries()]
    .map(([id, label]) => ({ id, label }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
