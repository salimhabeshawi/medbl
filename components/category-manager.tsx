"use client";

import { useActionState, useEffect, useState } from "react";
import { createCategory, updateCategory, deleteCategory, type CategoryFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { LoadingSpinner } from "@/components/loading-spinner";
import { DeleteCategoryButton } from "@/components/delete-category-button";
import { AlertTriangle, Edit2, Check, X } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export type CategoryRecord = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

function EditableCategoryRow({
  category,
  onCancel,
  onSaved,
}: {
  category: CategoryRecord;
  onCancel: () => void;
  onSaved: (nameAm: string, nameEn: string) => void;
}) {
  const tMod = useTranslations("Moderate");
  const tCommon = useTranslations("Common");
  const [editNameAm, setEditNameAm] = useState(category.name_am ?? "");
  const [editNameEn, setEditNameEn] = useState(category.name_en ?? "");
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateCategory,
    {} as CategoryFormState,
  );

  useEffect(() => {
    if (updateState.success) onSaved(editNameAm.trim(), editNameEn.trim());
  }, [editNameAm, editNameEn, onSaved, updateState.success]);

  return (
    <>
      <form
        action={updateFormAction}
        className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-background p-3"
      >
        <input type="hidden" name="category_id" value={category.id} />
        <Input
          name="name_am"
          value={editNameAm}
          onChange={(event) => setEditNameAm(event.target.value)}
          placeholder={tMod("nameAmPlaceholder")}
          className="h-9 max-w-50"
        />
        <Input
          name="name_en"
          value={editNameEn}
          onChange={(event) => setEditNameEn(event.target.value)}
          placeholder={tMod("nameEnPlaceholder")}
          className="h-9 max-w-50"
        />
        <Button
          type="submit"
          size="sm"
          disabled={updatePending}
          aria-busy={updatePending || undefined}
        >
          {updatePending ? (
            <LoadingSpinner />
          ) : (
            <Check className="mr-1 size-3.5" />
          )}
          {updatePending ? tCommon("loading") : tMod("saveCategory")}
        </Button>
        <Button type="button" variant="ghost" size="sm" onClick={onCancel}>
          <X className="mr-1 size-3.5" />
          {tMod("cancel")}
        </Button>
      </form>
      {updateState.error ? (
        <Alert className="mt-2" variant="destructive">
          <AlertDescription>{updateState.error}</AlertDescription>
        </Alert>
      ) : null}
    </>
  );
}

export function CategoryManager({ categories }: { categories: CategoryRecord[] }) {
  const tMod = useTranslations("Moderate");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [state, formAction, pending] = useActionState(
    createCategory,
    {} as CategoryFormState,
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [categoryRows, setCategoryRows] = useState(categories);

  const startEdit = (cat: CategoryRecord) => {
    setEditingId(cat.id);
  };

  const cancelEdit = () => {
    setEditingId(null);
  };

  const saveCategoryLocally = (categoryId: string, nameAm: string, nameEn: string) => {
    setCategoryRows((current) =>
      current.map((category) =>
        category.id === categoryId
          ? { ...category, name_am: nameAm, name_en: nameEn }
          : category,
      ),
    );
    cancelEdit();
  };

  return (
    <div className="mt-10 border-t border-border/70 pt-8">
      <h3 className="font-serif text-xl font-semibold">{tMod("categoryRegistry")}</h3>
      <p className="mt-1 text-sm text-muted-foreground">{tMod("categoryRegistryDesc")}</p>

      {/* Form for creating new category */}
      <form action={formAction} className="mt-4 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input
          name="name_am"
          required
          placeholder={tMod("nameAmPlaceholder")}
          className="sm:max-w-xs"
        />
        <Input
          name="name_en"
          required
          placeholder={tMod("nameEnPlaceholder")}
          className="sm:max-w-xs"
        />
        <Button type="submit" disabled={pending} aria-busy={pending || undefined}>
          {pending ? <LoadingSpinner /> : null}
          {pending ? tCommon("loading") : tMod("addCategoryBtn")}
        </Button>
      </form>

      {state.error ? (
        <Alert className="mt-3" variant="destructive">
          <AlertDescription>{state.error}</AlertDescription>
        </Alert>
      ) : null}
      {state.success ? (
        <Alert className="mt-3 border-secondary/30 bg-secondary/10 text-secondary">
          <AlertDescription>{state.success}</AlertDescription>
        </Alert>
      ) : null}
      {/* Category list */}
      <div className="mt-6 space-y-2">
        {categoryRows.map((category) => {
          const isEditing = editingId === category.id;
          const missingAm = !category.name_am;
          const missingEn = !category.name_en;
          const categoryLabel = locale === "am"
            ? category.name_am || category.name_en
            : category.name_en || category.name_am;
          const counterpartLabel = locale === "am"
            ? category.name_en
            : category.name_am;

          if (isEditing) {
            return (
              <EditableCategoryRow
                key={category.id}
                category={category}
                onCancel={cancelEdit}
                onSaved={(nameAm, nameEn) =>
                  saveCategoryLocally(category.id, nameAm, nameEn)
                }
              />
            );
          }

          return (
            <div
              key={category.id}
              className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-border bg-card p-3 shadow-xs"
            >
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-semibold text-foreground">
                  {categoryLabel}
                </span>
                {counterpartLabel ? (
                  <span className="text-xs text-muted-foreground">
                    ({counterpartLabel})
                  </span>
                ) : null}

                {missingAm ? (
                  <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive text-xs gap-1">
                    <AlertTriangle className="size-3" />
                    {tMod("missingAmharic")}
                  </Badge>
                ) : null}
                {missingEn ? (
                  <Badge variant="outline" className="border-destructive/40 bg-destructive/10 text-destructive text-xs gap-1">
                    <AlertTriangle className="size-3" />
                    {tMod("missingEnglish")}
                  </Badge>
                ) : null}
              </div>

              <div className="flex items-center gap-2">
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={() => startEdit(category)}
                  className="h-8 text-xs text-muted-foreground hover:text-foreground"
                >
                  <Edit2 className="mr-1 size-3.5" />
                  {tMod("editCategory")}
                </Button>
                <form action={deleteCategory}>
                  <input type="hidden" name="category_id" value={category.id} />
                  {/* deleteCategory is a bare server action, so the button reads
                      its own in-flight state off the enclosing form. */}
                  <DeleteCategoryButton label={category.name_am || category.name_en || category.id} />
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
