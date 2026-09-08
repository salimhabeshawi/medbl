"use client";

import { useState } from "react";
import { X } from "lucide-react";
import { Input } from "@/components/ui/input";
import { useTranslations } from "next-intl";

export function TagInput({
  name = "tags",
  initialTags = [],
}: {
  name?: string;
  initialTags?: string[];
}) {
  const [tags, setTags] = useState(initialTags);
  const [draft, setDraft] = useState("");
  const tSubmit = useTranslations("Submit");

  function addDraft() {
    const next = draft.trim();
    if (!next) return;
    setTags((current) => (current.includes(next) ? current : [...current, next]));
    setDraft("");
  }

  function removeTag(tag: string) {
    setTags((current) => current.filter((item) => item !== tag));
  }

  return (
    <div className="space-y-2">
      <div className="flex min-h-10 flex-wrap items-center gap-2 rounded-lg border border-input bg-transparent px-2.5 py-1.5 focus-within:border-ring focus-within:ring-3 focus-within:ring-ring/30">
        {tags.map((tag) => (
          <span key={tag} className="inline-flex items-center gap-1 rounded-full bg-accent px-4 py-2 text-sm font-medium text-accent-foreground">
            #{tag}
            <button type="button" onClick={() => removeTag(tag)} className="cursor-pointer rounded-full p-0.5 hover:bg-background/50" aria-label={`${tSubmit("removeTag")} ${tag}`}>
              <X className="size-3" />
            </button>
          </span>
        ))}
        <Input
          value={draft}
          onChange={(event) => setDraft(event.target.value.replace(/\s/g, ""))}
          onKeyDown={(event) => {
            if (event.key === " " || event.key === "Enter") {
              event.preventDefault();
              addDraft();
            }
            if (event.key === "Backspace" && !draft && tags.length > 0) {
              removeTag(tags[tags.length - 1]);
            }
          }}
          onBlur={addDraft}
          placeholder={tags.length ? tSubmit("addAnotherTag") : tSubmit("tagPlaceholder")}
          className="h-7 min-w-32 flex-1 border-0 p-0 shadow-none focus-visible:ring-0"
          aria-label={tSubmit("addTag")}
        />
      </div>
      <input type="hidden" name={name} value={tags.join(" ")} />
    </div>
  );
}
