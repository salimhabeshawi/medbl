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

export function FavoriteToggle({
  poemId,
  initialFavorited,
  onUnfavorited,
}: {
  poemId: string;
  initialFavorited: boolean;
  onUnfavorited?: () => void;
}) {
  const [favorited, setFavorited] = useState(initialFavorited);
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);
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
    if (!result.favorited) onUnfavorited?.();
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
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
                favorited ? "Remove from favorites" : "Add to favorites"
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
            {favorited ? "Remove favorite" : "Add favorite"}
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
      {error ? <span className="sr-only">{error}</span> : null}
    </span>
  );
}
