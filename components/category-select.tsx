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
}: {
  categories: CategorySelectRecord[];
  defaultValue?: string;
  name?: string;
}) {
  const locale = useLocale();
  const tSubmit = useTranslations("Submit");

  const getCategoryLabel = (cat: CategorySelectRecord) => {
    if (locale === "am") return cat.name_am || cat.name_en || "";
    return cat.name_en || cat.name_am || "";
  };

  return (
    <Select name={name} defaultValue={defaultValue}>
      <SelectTrigger className="h-10 w-full">
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
