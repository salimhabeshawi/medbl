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
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const tPoems = useTranslations("Poems");
  const inFlight = useRef(false);

  async function handleClick() {
    // Ignore clicks while a previous request is still in flight
    // (double-click / rapid toggling).
    if (inFlight.current) return;
    inFlight.current = true;
    setPending(true);
    setError(null);

    const result = await toggleFavorite(poemId);

    inFlight.current = false;
    setPending(false);

    if (result.error) {
      setError(result.error);
      toast.error(result.error);
      return;
    }

    setFavorited(result.favorited);
    if (result.favoriteCount !== undefined) setFavoriteCount(result.favoriteCount);
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
                favorited ? tPoems("favoriteRemoveLabel") : tPoems("favoriteAddLabel")
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
            {favorited ? tPoems("favoriteRemoveTooltip") : tPoems("favoriteAddTooltip")}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      <span className="min-w-5 text-center text-xs font-medium text-muted-foreground" aria-label={tPoems("likesCount", { count: favoriteCount })}>
        {favoriteCount}
      </span>
      {error ? <span className="sr-only">{error}</span> : null}
    </span>
  );
}
