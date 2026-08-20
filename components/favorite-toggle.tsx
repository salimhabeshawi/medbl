"use client";

import { useRef, useState } from "react";
import { toggleFavorite } from "@/app/actions";

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
      return;
    }

    setFavorited(result.favorited);
    if (!result.favorited) onUnfavorited?.();
  }

  return (
    <span className="inline-flex flex-col items-end gap-0.5">
      <button
        type="button"
        onClick={handleClick}
        disabled={pending}
        aria-pressed={favorited}
        aria-label={favorited ? "Remove from favorites" : "Add to favorites"}
        className={
          "inline-flex h-8 w-8 items-center justify-center rounded-full text-lg leading-none transition select-none " +
          (pending
            ? "cursor-wait opacity-60"
            : "cursor-pointer hover:scale-110 hover:bg-zinc-100 dark:hover:bg-zinc-800") +
          (favorited ? " text-red-600" : " text-zinc-400")
        }
      >
        {favorited ? "\u2665" : "\u2661"}
      </button>
      {error ? (
        <span className="max-w-[160px] text-center text-[11px] text-red-600">
          {error}
        </span>
      ) : null}
    </span>
  );
}