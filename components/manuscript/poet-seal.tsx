import { cn } from "cn";

/**
 * A poet's monogram as a scribe's seal: the first Ge'ez letter of their
 * Amharic name inside a double ring. Decorative — the name itself is always
 * printed next to it.
 */
export function PoetSeal({
  name,
  size = "md",
  className,
}: {
  name: string;
  size?: "md" | "lg";
  className?: string;
}) {
  const initial = Array.from(name.trim())[0] ?? "";

  return (
    <span
      aria-hidden="true"
      className={cn(
        "grid shrink-0 place-items-center rounded-full border border-primary/45 bg-accent/70 font-sans leading-none text-primary",
        "shadow-[inset_0_0_0_3px_var(--card),inset_0_0_0_4px_color-mix(in_oklch,var(--primary),transparent_70%)]",
        size === "lg" ? "size-20 text-4xl sm:size-24 sm:text-5xl" : "size-12 text-xl",
        className,
      )}
    >
      {initial}
    </span>
  );
}
