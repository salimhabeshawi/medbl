"use client";

import { useRef, useState } from "react";
import { toggleFavorite } from "@/app/actions";
import { Button } from "@/components/ui/button";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Heart, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function FavoriteToggle({
  poemId,
  initialFavorited,
  initialFavoriteCount = 0,
  onUnfavorited,
}: {
  poemId: string;
  initialFavorited: boolean;
  initialFavoriteCount?: number;
  onUnfavorited?: () => void;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [favoriteCount, setFavoriteCount] = useState(initialFavoriteCount);
  // pending = server request is in flight (button disabled, spinner shown)
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  // Prevent a second click while a request is already in flight.
  const inFlight = useRef(false);
  const tPoems = useTranslations("Poems");

  async function handleClick() {
    if (inFlight.current) return;
    inFlight.current = true;
    setError(null);

    // ── Optimistic update ────────────────────────────────────────────────────
    // Apply the expected result immediately so the UI responds in the same
    // frame as the click, without waiting for the server round-trip.
    const prevFavorited = favorited;
    const prevCount = favoriteCount;
    const nextFavorited = !prevFavorited;
    const nextCount = prevFavorited
      ? Math.max(0, prevCount - 1)
      : prevCount + 1;

    setFavorited(nextFavorited);
    setFavoriteCount(nextCount);
    setPending(true);
    // ────────────────────────────────────────────────────────────────────────

    const result = await toggleFavorite(poemId);

    inFlight.current = false;
    setPending(false);

    if (result.error) {
      // Revert to the state before the click.
      setFavorited(prevFavorited);
      setFavoriteCount(prevCount);
      setError(result.error);
      toast.error(result.error);
      return;
    }

    // Correct with the authoritative server values.
    // In the normal case these match the optimistic values exactly.
    setFavorited(result.favorited);
    if (result.favoriteCount !== undefined) {
      setFavoriteCount(result.favoriteCount);
    }
    if (!result.favorited) onUnfavorited?.();
  }

  return (
    <span className="inline-flex items-center gap-2">
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              onClick={handleClick}
              disabled={pending}
              variant="outline"
              size="icon"
              aria-pressed={favorited}
              aria-label={
                favorited
                  ? tPoems("favoriteRemoveLabel")
                  : tPoems("favoriteAddLabel")
              }
              className={
                "rounded-full border-border bg-card shadow-none transition hover:border-primary/60 hover:bg-accent " +
                (pending ? "cursor-wait opacity-70 " : "") +
                (favorited ? "text-destructive" : "text-secondary")
              }
            >
              {pending ? (
                <Loader2 className="size-4 animate-spin" aria-hidden="true" />
              ) : (
                <Heart
                  className={favorited ? "size-4 fill-current" : "size-4"}
                  aria-hidden="true"
                />
              )}
            </Button>
          </TooltipTrigger>
          <TooltipContent>
            {favorited
              ? tPoems("favoriteRemoveTooltip")
              : tPoems("favoriteAddTooltip")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span
        className="min-w-5 text-center text-xs font-medium text-muted-foreground"
        aria-label={tPoems("likesCount", { count: favoriteCount })}
      >
        {favoriteCount}
      </span>
      {error ? <span className="sr-only">{error}</span> : null}
    </span>
  );
}
