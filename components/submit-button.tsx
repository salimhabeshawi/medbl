"use client";

import { useFormStatus } from "react-dom";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";

/**
 * A submit button that reports its own in-flight state.
 *
 * Use this for a plain `<form action={someServerAction}>` where the form has no
 * pending state of its own. `useFormStatus` reads the status of the
 * *enclosing* form, so this must be rendered as a descendant of that form —
 * which is exactly where a submit button lives.
 *
 * Components that already track their own request (anything using
 * `useActionState` or `useTransition`) do not need this: they should render
 * `<LoadingSpinner />` next to their own `pending` flag. Both routes share the
 * same `LoadingSpinner` and the same rule — disabled + spinner for the whole
 * duration of the request.
 *
 * `pendingLabel` replaces the visible text while in flight. Leave it off to
 * keep the label, which is often better for a wide button where the text
 * already explains the action and swapping it would make the button reflow.
 */
export function SubmitButton({
  children,
  pendingLabel,
  disabled,
  ...props
}: React.ComponentProps<typeof Button> & { pendingLabel?: React.ReactNode }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      disabled={disabled || pending}
      aria-busy={pending || undefined}
      {...props}
    >
      {pending ? <LoadingSpinner /> : null}
      {/* Children are rendered as-is when there is no pendingLabel, so a button
          with an icon + text keeps its flex `gap` and never reflows mid-request.
          Only the label-swapping case wraps in a span. */}
      {pending && pendingLabel ? <span>{pendingLabel}</span> : children}
    </Button>
  );
}
