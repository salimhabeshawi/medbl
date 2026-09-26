"use client";

import { useLocale, useTranslations } from "next-intl";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export type CategorySelectRecord = {
  id: string;
  name_am: string | null;
  name_en: string | null;
};

export function CategorySelect({
  categories,
  defaultValue = "",
  name = "category_id",
  required = false,
  value,
  onValueChange,
  invalid = false,
}: {
  categories: CategorySelectRecord[];
  defaultValue?: string;
  name?: string;
  /** Marks the control as required for assistive tech (no native validation). */
  required?: boolean;
  /** Controlled selected category id. Omit both this and onValueChange to
   *  keep the select uncontrolled (e.g. the moderator review form). */
  value?: string;
  onValueChange?: (value: string) => void;
  /** Renders the error styling used by the submit forms' inline validation. */
  invalid?: boolean;
}) {
  const locale = useLocale();
  const tSubmit = useTranslations("Submit");
  const controlled = value !== undefined;

  const getCategoryLabel = (cat: CategorySelectRecord) => {
    if (locale === "am") return cat.name_am || cat.name_en || "";
    return cat.name_en || cat.name_am || "";
  };

  return (
    <Select
      name={name}
      value={controlled ? value : undefined}
      defaultValue={controlled ? undefined : defaultValue}
      onValueChange={onValueChange}
    >
      <SelectTrigger
        className="h-10 w-full"
        aria-invalid={invalid || undefined}
        aria-required={required || undefined}
      >
        <SelectValue placeholder={tSubmit("selectCategory")} />
      </SelectTrigger>
      <SelectContent>
        {categories.map((category) => (
          <SelectItem key={category.id} value={category.id}>
            {getCategoryLabel(category)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
