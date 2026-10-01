"use client";

import { useFormStatus } from "react-dom";
import { Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { LoadingSpinner } from "@/components/loading-spinner";

/**
 * The delete button for one category row.
 *
 * It is a separate component purely so it can call `useFormStatus`, which
 * reports the state of the *enclosing* `<form action={deleteCategory}>`.
 * `deleteCategory` is a bare server action (no `useActionState` state to hang
 * off), so the form itself is the only place the in-flight flag exists — and it
 * has to be read from a descendant of that form.
 */
export function DeleteCategoryButton({ label }: { label: string }) {
  const { pending } = useFormStatus();

  return (
    <Button
      type="submit"
      variant="ghost"
      size="sm"
      disabled={pending}
      aria-busy={pending || undefined}
      className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
      aria-label={`Delete ${label}`}
    >
      {pending ? <LoadingSpinner /> : <Trash2 className="size-3.5" />}
    </Button>
  );
}
