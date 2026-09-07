"use client";

import { useActionState } from "react";
import { createCategory, deleteCategory, type CategoryFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";

export function CategoryManager({ categories }: { categories: { id: string; name: string }[] }) {
  const [state, formAction, pending] = useActionState(
    createCategory,
    {} as CategoryFormState,
  );

  return (
    <div className="mt-10 border-t border-border/70 pt-8">
      <h3 className="font-serif text-xl font-semibold">Category registry</h3>
      <p className="mt-1 text-sm text-muted-foreground">Add categories that contributors can choose from.</p>
      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row">
        <Input name="name" required placeholder="New category name" className="sm:max-w-xs" />
        <Button type="submit" disabled={pending}>{pending ? "Adding..." : "Add category"}</Button>
      </form>
      {state.error ? <Alert className="mt-3" variant="destructive"><AlertDescription>{state.error}</AlertDescription></Alert> : null}
      {state.success ? <Alert className="mt-3 border-secondary/30 bg-secondary/10 text-secondary"><AlertDescription>{state.success}</AlertDescription></Alert> : null}
      <div className="mt-4 flex flex-wrap gap-2">{categories.map((category) => <span key={category.id} className="inline-flex items-center gap-2 rounded-full bg-accent px-3 py-1 text-xs font-medium">{category.name}<form action={deleteCategory}><input type="hidden" name="category_id" value={category.id} /><button type="submit" className="cursor-pointer text-muted-foreground hover:text-destructive" aria-label={`Delete ${category.name}`}>×</button></form></span>)}</div>
    </div>
  );
}
