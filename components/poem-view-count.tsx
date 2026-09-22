"use client";

import { Eye } from "lucide-react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

export function PoemViewCount({ viewCount }: { viewCount: number }) {
  const tPoems = useTranslations("Poems");

  return (
    <span className="pointer-events-none inline-flex items-center gap-2">
      {/* Rendered with the same outline/icon Button styles as the neighboring
          like/copy/share icon buttons, but as a non-interactive span: no
          hover, no cursor, and clicks pass through (pointer-events-none). */}
      <Button
        asChild
        variant="outline"
        size="icon"
        className="rounded-full border-border bg-card text-secondary shadow-none"
      >
        <span>
          <Eye className="size-4" aria-hidden="true" />
        </span>
      </Button>
      <span
        className="min-w-5 text-center text-xs font-medium text-muted-foreground"
        aria-label={tPoems("viewsCount", { count: viewCount })}
      >
        {viewCount}
      </span>
    </span>
  );
}
