"use client";

import { useActionState, useState } from "react";
import { createCategory, updateCategory, deleteCategory, type CategoryFormState } from "@/app/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { AlertTriangle, Edit2, Check, X, Trash2 } from "lucide-react";
import { useLocale, useTranslations } from "next-intl";

export type CategoryRecord = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

export function CategoryManager({ categories }: { categories: CategoryRecord[] }) {
  const tMod = useTranslations("Moderate");
  const tCommon = useTranslations("Common");
  const locale = useLocale();

  const [state, formAction, pending] = useActionState(
    createCategory,
    {} as CategoryFormState,
  );

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editNameAm, setEditNameAm] = useState("");
  const [editNameEn, setEditNameEn] = useState("");
  const [updateState, updateFormAction, updatePending] = useActionState(
    updateCategory,
    {} as CategoryFormState,
  );

  const startEdit = (cat: CategoryRecord) => {
    setEditingId(cat.id);
    setEditNameAm(cat.name_am ?? "");
    setEditNameEn(cat.name_en ?? "");
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditNameAm("");
    setEditNameEn("");
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
        <Button type="submit" disabled={pending}>
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
      {updateState.error ? (
        <Alert className="mt-3" variant="destructive">
          <AlertDescription>{updateState.error}</AlertDescription>
        </Alert>
      ) : null}

      {/* Category list */}
      <div className="mt-6 space-y-2">
        {categories.map((category) => {
          const isEditing = editingId === category.id;
          const missingAm = !category.name_am;
          const missingEn = !category.name_en;
          const categoryLabel = locale === "am"
            ? category.name_am || category.name_en
            : category.name_en || category.name_am;

          if (isEditing) {
            return (
              <form
                key={category.id}
                action={async (fd) => {
                  await updateFormAction(fd);
                  setEditingId(null);
                }}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-primary/30 bg-background p-3"
              >
                <input type="hidden" name="category_id" value={category.id} />
                <Input
                  name="name_am"
                  value={editNameAm}
                  onChange={(e) => setEditNameAm(e.target.value)}
                  placeholder={tMod("nameAmPlaceholder")}
                  className="h-9 max-w-[200px]"
                />
                <Input
                  name="name_en"
                  value={editNameEn}
                  onChange={(e) => setEditNameEn(e.target.value)}
                  placeholder={tMod("nameEnPlaceholder")}
                  className="h-9 max-w-[200px]"
                />
                <Button type="submit" size="sm" disabled={updatePending}>
                  <Check className="mr-1 size-3.5" />
                  {tMod("saveCategory")}
                </Button>
                <Button type="button" variant="ghost" size="sm" onClick={cancelEdit}>
                  <X className="mr-1 size-3.5" />
                  {tMod("cancel")}
                </Button>
              </form>
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
                {category.name_am && category.name_en ? (
                  <span className="text-xs text-muted-foreground">
                    ({category.name_en})
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
                  <Button
                    type="submit"
                    variant="ghost"
                    size="sm"
                    className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                    aria-label={`Delete ${category.name_am || category.name_en}`}
                  >
                    <Trash2 className="size-3.5" />
                  </Button>
                </form>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
