"use client";

import { useRef, useState } from "react";
import { Info } from "lucide-react";
import { cn } from "cn";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { useTranslations } from "next-intl";

type AttributionStatus = "verified" | "community" | "disputed";

const BADGE_VARIANTS: Record<
  AttributionStatus,
  React.ComponentProps<typeof Badge>["variant"]
> = {
  verified: "default",
  community: "secondary",
  disputed: "destructive",
};

const LABEL_KEYS: Record<AttributionStatus, string> = {
  verified: "verifiedBadge",
  community: "communityBadge",
  disputed: "disputedBadge",
};

const TOOLTIP_KEYS: Record<AttributionStatus, string> = {
  verified: "verifiedTooltip",
  community: "communityTooltip",
  disputed: "disputedTooltip",
};

function isAttributionStatus(status?: string | null): status is AttributionStatus {
  return (
    status === "verified" || status === "community" || status === "disputed"
  );
}

/**
 * The verified / community / disputed attribution badge plus a muted info icon
 * whose tooltip explains what the tag means. Used on every public poem card and
 * on the poem detail page, so the wording lives in the `Poems` messages
 * namespace and is always translated.
 *
 * `pointer-events-auto` is baked in because poem cards render their content in a
 * `pointer-events-none` layer (the whole card is covered by a link overlay) —
 * without it the icon could never be hovered or tapped.
 */
export function AttributionBadge({
  status,
  className,
}: {
  status?: string | null;
  className?: string;
}) {
  const tPoems = useTranslations("Poems");
  // The tooltip is controlled so a tap (touch devices, where Radix deliberately
  // ignores pointermove) can toggle it. Hover/focus still open it through Radix.
  const [open, setOpen] = useState(false);
  const pointerType = useRef<string>("");

  if (!isAttributionStatus(status)) return null;

  const tooltip = tPoems(TOOLTIP_KEYS[status]);

  return (
    <span
      className={cn("pointer-events-auto inline-flex items-center gap-1", className)}
    >
      <Badge variant={BADGE_VARIANTS[status]}>{tPoems(LABEL_KEYS[status])}</Badge>
      <TooltipProvider>
        <Tooltip open={open} onOpenChange={setOpen}>
          <TooltipTrigger asChild>
            <button
              type="button"
              aria-label={tooltip}
              className="inline-flex cursor-help items-center justify-center rounded-full text-muted-foreground transition-colors hover:text-foreground focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:outline-none"
              onPointerDown={(event) => {
                pointerType.current = event.pointerType;
              }}
              onClick={() => {
                if (pointerType.current === "touch") setOpen((prev) => !prev);
              }}
            >
              <Info className="size-3.5" aria-hidden="true" />
            </button>
          </TooltipTrigger>
          <TooltipContent className="max-w-64 text-pretty leading-5">
            {tooltip}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    </span>
  );
}
