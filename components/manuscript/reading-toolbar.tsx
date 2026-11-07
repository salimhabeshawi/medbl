"use client";

import {
  useEffect,
  useSyncExternalStore,
  type ChangeEvent,
  type ComponentProps,
} from "react";
import { ALargeSmall } from "lucide-react";
import { useTranslations } from "next-intl";
import { PoemActions } from "@/components/poem-actions";

const STORAGE_KEY = "medbl:verse-scale";
const CHANGE_EVENT = "medbl:verse-scale-change";
const MIN_SCALE = 0.8;
const MAX_SCALE = 1.5;
const SCALE_STEP = 0.05;

// The preference lives in localStorage, outside React, so it is read through
// useSyncExternalStore: the server snapshot is always 100%, and the client
// picks up the stored value without a second, effect-driven render.
function readScale(): number {
  try {
    const raw = Number(window.localStorage.getItem(STORAGE_KEY));
    if (raw >= MIN_SCALE && raw <= MAX_SCALE) return raw;
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
 * Text size is a per-reader convenience controlled by a range slider and
 * remembered in localStorage. It is purely client-side, so no loading state.
 */
export function ReadingToolbar(props: ComponentProps<typeof PoemActions>) {
  const tPoems = useTranslations("Poems");
  const scale = useSyncExternalStore(subscribe, readScale, () => 1);

  // Mirror the preference onto <html> so every .verse picks it up.
  useEffect(() => {
    document.documentElement.style.setProperty("--verse-scale", String(scale));
  }, [scale]);

  function updateScale(event: ChangeEvent<HTMLInputElement>) {
    const next = Number(event.target.value);
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
        <PoemActions {...props} showFavorite={false} />
        <span aria-hidden="true" className="mx-0.5 h-6 w-px bg-border" />
        <div className="flex items-center gap-2 px-1">
          <ALargeSmall
            className="size-4 shrink-0 text-secondary"
            aria-hidden="true"
          />
          <label htmlFor="poem-text-size" className="sr-only">
            {tPoems("textSizeValue", { size: percent })}
          </label>
          <input
            id="poem-text-size"
            type="range"
            min={MIN_SCALE}
            max={MAX_SCALE}
            step={SCALE_STEP}
            value={scale}
            onChange={updateScale}
            aria-label={tPoems("textSizeValue", { size: percent })}
            className="h-2 w-24 cursor-pointer accent-primary sm:w-32"
          />
          <span className="min-w-10 text-right text-xs font-medium text-muted-foreground">
            {percent}
          </span>
        </div>
      </div>
    </div>
  );
}
