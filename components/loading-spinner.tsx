"use client";

import { Loader2 } from "lucide-react";
import { cn } from "cn";

/**
 * THE loading indicator for the whole app — the single source of truth for
 * "this button is talking to the server right now".
 *
 * The rule (AGENTS.md "Guidelines for future changes"): any button or control
 * that triggers a network request — a database write, an RPC, an auth action,
 * or a navigation whose data comes from the server — must render this spinner
 * and disable itself for the duration. Without it a slow connection looks like
 * a frozen, broken UI.
 *
 * Deliberately carries NO size class: the shadcn `Button` already scales child
 * icons through `[&_svg:not([class*='size-'])]:size-4` (plus the `size="sm"` /
 * `xs` / `icon-*` overrides), so the same component is correctly sized in every
 * button variant without special-casing. Pass an explicit size only outside a
 * Button (e.g. as a bare input adornment).
 *
 * Purely decorative — the surrounding control conveys state through
 * `disabled` and `aria-busy`, so this is hidden from assistive tech.
 */
export function LoadingSpinner({ className }: { className?: string }) {
  return (
    <Loader2 className={cn("animate-spin", className)} aria-hidden="true" />
  );
}
