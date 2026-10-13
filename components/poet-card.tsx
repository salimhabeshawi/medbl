import Link from "next/link";
import type { ReactNode } from "react";
import { PoetSeal } from "@/components/manuscript/poet-seal";

/**
 * Shared poet tile for the home page and the /poets directory: seal,
 * Amharic name, transliteration, then whatever stat badges the caller
 * passes as children. The whole card is the link.
 */
export function PoetCard({
  id,
  nameAm,
  nameEn,
  children,
}: {
  id: string;
  nameAm: string;
  nameEn?: string | null;
  children?: ReactNode;
}) {
  return (
    <Link
      href={`/poets/${id}`}
      className="content-card group flex h-full items-start gap-4 rounded-xl border p-4 sm:p-5"
    >
      <PoetSeal name={nameAm} />
      <div className="min-w-0 flex-1">
        <p className="truncate font-semibold text-foreground transition-colors group-hover:text-primary">
          {nameAm}
        </p>
        {nameEn ? (
          <p className="truncate text-sm text-muted-foreground">{nameEn}</p>
        ) : null}
        {children ? (
          <div className="mt-3 flex flex-wrap gap-2">{children}</div>
        ) : null}
      </div>
    </Link>
  );
}
