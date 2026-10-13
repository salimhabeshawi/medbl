"use client";

import { useEffect, useSyncExternalStore, type ComponentProps } from "react";
import { ALargeSmall } from "lucide-react";
import { useTranslations } from "next-intl";
import { PoemActions } from "@/components/poem-actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

const SCALES = [1, 1.15, 1.3, 0.9] as const;
const STORAGE_KEY = "medbl:verse-scale";
const CHANGE_EVENT = "medbl:verse-scale-change";

// The preference lives in localStorage, outside React, so it is read through
// useSyncExternalStore: the server snapshot is always 100%, and the client
// picks up the stored value without a second, effect-driven render.
function readScale(): number {
  try {
    const raw = Number(window.localStorage.getItem(STORAGE_KEY));
    if ((SCALES as readonly number[]).includes(raw)) return raw;
  } catch {
    // Storage unavailable (private window, blocked site data): default size.
  }
  return 1;
}

function subscribe(onChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onChange);
  window.addEventListener("storage", onChange);
  return () => {
    window.removeEventListener(CHANGE_EVENT, onChange);
    window.removeEventListener("storage", onChange);
  };
}

/**
 * The reading page's floating toolbar: the poem's actions plus a text-size
 * control, kept within thumb reach at the bottom of the screen while the
 * poem scrolls, and settling under the page once the reader reaches the end.
 *
 * Text size is a per-reader convenience: it cycles 100% → 115% → 130% → 90%
 * and is remembered in localStorage (wrapped in try/catch — private windows
 * and blocked storage just fall back to 100%). It is purely client-side, so
 * no loading state.
 */
export function ReadingToolbar(props: ComponentProps<typeof PoemActions>) {
  const tPoems = useTranslations("Poems");
  const scale = useSyncExternalStore(subscribe, readScale, () => 1);

  // Mirror the preference onto <html> so every .verse picks it up.
  useEffect(() => {
    document.documentElement.style.setProperty("--verse-scale", String(scale));
  }, [scale]);

  function cycleScale() {
    const index = (SCALES as readonly number[]).indexOf(scale);
    const next = SCALES[(index + 1) % SCALES.length];
    try {
      window.localStorage.setItem(STORAGE_KEY, String(next));
    } catch {
      // Not persisted — and readScale will keep returning the default, so
      // apply this visit's choice directly instead.
      document.documentElement.style.setProperty("--verse-scale", String(next));
      return;
    }
    window.dispatchEvent(new Event(CHANGE_EVENT));
  }

  const percent = `${Math.round(scale * 100)}%`;

  return (
    <div className="sticky bottom-3 z-30 mt-6 flex justify-center sm:bottom-5">
      <div className="flex items-center gap-2 rounded-full border border-border bg-card/90 px-2.5 py-2 shadow-[0_12px_32px_-16px_color-mix(in_oklch,var(--foreground),transparent_60%)] backdrop-blur-md supports-[backdrop-filter]:bg-card/80">
        <PoemActions {...props} />
        <span aria-hidden="true" className="mx-0.5 h-6 w-px bg-border" />
        <TooltipProvider>
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={cycleScale}
                aria-label={tPoems("textSizeValue", { size: percent })}
                className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
              >
                <ALargeSmall className="size-4" aria-hidden="true" />
              </Button>
            </TooltipTrigger>
            <TooltipContent>
              {tPoems("textSize")} · {percent}
            </TooltipContent>
          </Tooltip>
        </TooltipProvider>
      </div>
    </div>
  );
}
