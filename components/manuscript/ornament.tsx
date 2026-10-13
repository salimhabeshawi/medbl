import { cn } from "cn";

/**
 * Section divider in the manuscript style: the Ethiopic section mark ፨
 * (U+1368) between two hairlines that fade out toward the edges. Purely
 * decorative — exposed to assistive tech only as a separator.
 */
export function Ornament({
  className,
  glyph = "፨",
}: {
  className?: string;
  glyph?: string;
}) {
  return (
    <div
      role="separator"
      className={cn(
        "flex items-center gap-3 text-primary/70 select-none",
        className,
      )}
    >
      <span
        aria-hidden="true"
        className="h-px flex-1 bg-linear-to-r from-transparent via-border to-border"
      />
      <span aria-hidden="true" className="font-sans text-base leading-none">
        {glyph}
      </span>
      <span
        aria-hidden="true"
        className="h-px flex-1 bg-linear-to-l from-transparent via-border to-border"
      />
    </div>
  );
}
