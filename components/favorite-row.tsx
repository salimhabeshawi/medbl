"use client";

import { useState } from "react";
import Link from "next/link";
import { FavoriteToggle } from "./favorite-toggle";

export function FavoriteRow({
  poem,
  poet,
}: {
  poem: {
    id: string;
    title: string;
    category: string | null;
    tags: string[] | null;
  };
  poet: { name_am: string; name_en: string } | null;
}) {
  const [hidden, setHidden] = useState(false);

  if (hidden) return null;

  return (
    <li className="flex items-center justify-between gap-4 py-3">
      <div className="min-w-0">
        <Link
          href={`/poems/${poem.id}`}
          className="font-medium hover:underline"
        >
          {poem.title}
        </Link>
        {poet ? (
          <span className="ml-2 text-sm text-zinc-500">
            — {poet.name_am ?? poet.name_en}
          </span>
        ) : null}
        {poem.category ? (
          <span className="ml-2 text-sm text-zinc-500">{poem.category}</span>
        ) : null}
        {Array.isArray(poem.tags) && poem.tags.length > 0 ? (
          <span className="ml-2 text-sm text-zinc-400">
            {poem.tags.map((t: string) => (
              <span key={t} className="mr-1">
                #{t}
              </span>
            ))}
          </span>
        ) : null}
      </div>
      <FavoriteToggle
        poemId={poem.id}
        initialFavorited={true}
        onUnfavorited={() => setHidden(true)}
      />
    </li>
  );
}