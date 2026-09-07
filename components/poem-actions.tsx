"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FavoriteToggle } from "@/components/favorite-toggle";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";

export function PoemActions({
  poemId,
  title,
  body,
  initialFavorited,
  canFavorite,
}: {
  poemId: string;
  title: string;
  body: string;
  initialFavorited: boolean;
  canFavorite: boolean;
}) {
  async function copyPoem() {
    try {
      await navigator.clipboard.writeText(`${title}\n\n${body}`);
      toast.success("Poem copied");
    } catch {
      toast.error("Could not copy poem");
    }
  }

  async function sharePoem() {
    const url = window.location.href;

    try {
      if (navigator.share) {
        await navigator.share({ title, text: title, url });
        return;
      }

      await navigator.clipboard.writeText(url);
      toast.success("Link copied");
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error("Could not share poem");
    }
  }

  return (
    <TooltipProvider>
      <div className="flex shrink-0 items-center gap-2">
        {canFavorite ? (
          <FavoriteToggle
            poemId={poemId}
            initialFavorited={initialFavorited}
          />
        ) : (
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                asChild
                variant="outline"
                size="icon"
                className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
              >
                <Link href="/login" aria-label="Log in to favorite">
                  <Heart className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>Log in to favorite</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyPoem}
              aria-label="Copy poem"
              className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
            >
              <Copy className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Copy poem</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={sharePoem}
              aria-label="Share poem"
              className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
            >
              <Share2 className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>Share poem</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
