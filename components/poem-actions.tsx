"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { FavoriteToggle } from "@/components/favorite-toggle";
import { PoemViewCount } from "@/components/poem-view-count";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Copy, Heart, Share2 } from "lucide-react";
import { toast } from "sonner";
import { useTranslations } from "next-intl";

export function PoemActions({
  poemId,
  title,
  body,
  poetNameAm,
  initialFavorited,
  initialFavoriteCount,
  canFavorite,
  viewCount,
}: {
  poemId: string;
  title: string;
  body: string;
  poetNameAm: string;
  initialFavorited: boolean;
  initialFavoriteCount: number;
  canFavorite: boolean;
  viewCount: number;
}) {
  const tPoems = useTranslations("Poems");

  // Shared text for both share and copy. The poet name is always the Amharic
  // name regardless of UI locale — this is the poem's own content, which is
  // never translated. The URL is included at the end of the text itself, so
  // navigator.share must NOT also receive a separate `url` field (some share
  // targets would append it a second time). Body line breaks are preserved
  // exactly as stored.
  function buildShareText(): string {
    return [title, body, `በ ${poetNameAm}`, window.location.href].join(
      "\n\n",
    );
  }

  async function copyPoem() {
    try {
      await navigator.clipboard.writeText(buildShareText());
      toast.success(tPoems("poemCopied"));
    } catch {
      toast.error(tPoems("copyError"));
    }
  }

  async function sharePoem() {
    try {
      if (navigator.share) {
        await navigator.share({ title, text: buildShareText() });
        return;
      }

      await navigator.clipboard.writeText(buildShareText());
      toast.success(tPoems("linkCopied"));
    } catch (error) {
      if (error instanceof DOMException && error.name === "AbortError") {
        return;
      }

      toast.error(tPoems("shareError"));
    }
  }

  return (
    <TooltipProvider>
      <div className="flex shrink-0 items-center gap-2">
        <PoemViewCount viewCount={viewCount} />
        {canFavorite ? (
          <FavoriteToggle
            poemId={poemId}
            initialFavorited={initialFavorited}
            initialFavoriteCount={initialFavoriteCount}
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
                <Link href="/login" aria-label={tPoems("loginToFavorite")}>
                  <Heart className="size-4" aria-hidden="true" />
                </Link>
              </Button>
            </TooltipTrigger>
            <TooltipContent>{tPoems("loginToFavorite")}</TooltipContent>
          </Tooltip>
        )}

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={copyPoem}
              aria-label={tPoems("copyPoem")}
              className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
            >
              <Copy className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tPoems("copyPoem")}</TooltipContent>
        </Tooltip>

        <Tooltip>
          <TooltipTrigger asChild>
            <Button
              type="button"
              variant="outline"
              size="icon"
              onClick={sharePoem}
              aria-label={tPoems("sharePoem")}
              className="rounded-full border-border bg-card text-secondary shadow-none transition hover:border-primary/60 hover:bg-accent"
            >
              <Share2 className="size-4" aria-hidden="true" />
            </Button>
          </TooltipTrigger>
          <TooltipContent>{tPoems("sharePoem")}</TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  );
}
