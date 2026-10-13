import type { ReactNode } from "react";
import { cn } from "cn";

/**
 * Outer shell shared by the landing sections: a centered max-w-6xl column,
 * optionally sitting on the tinted full-bleed "band" between two rules.
 */
export function LandingSection({
  labelledBy,
  band = false,
  className,
  children,
}: {
  labelledBy: string;
  band?: boolean;
  className?: string;
  children: ReactNode;
}) {
  const column = "mx-auto max-w-6xl px-4 py-16 sm:px-6 sm:py-24";

  if (!band) {
    return (
      <section aria-labelledby={labelledBy} className={cn(column, className)}>
        {children}
      </section>
    );
  }

  return (
    <section
      aria-labelledby={labelledBy}
      className={cn("border-y border-border/70 bg-accent/25", className)}
    >
      <div className={column}>{children}</div>
    </section>
  );
}

/** Eyebrow + serif title + optional lead paragraph. */
export function SectionHeading({
  id,
  eyebrow,
  eyebrowTone = "primary",
  title,
  description,
}: {
  id: string;
  eyebrow?: ReactNode;
  eyebrowTone?: "primary" | "secondary";
  title: ReactNode;
  description?: ReactNode;
}) {
  return (
    <>
      {eyebrow ? (
        <p
          className={cn(
            "mb-3 text-sm font-semibold uppercase tracking-[0.18em]",
            eyebrowTone === "primary" ? "text-primary" : "text-secondary",
          )}
        >
          {eyebrow}
        </p>
      ) : null}
      <h2 id={id} className="font-serif text-3xl font-semibold sm:text-5xl">
        {title}
      </h2>
      {description ? (
        <p className="mt-4 max-w-2xl text-base leading-7 text-muted-foreground">
          {description}
        </p>
      ) : null}
    </>
  );
}
