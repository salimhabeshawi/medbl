import Link from "next/link";
import { ArrowRight } from "lucide-react";

/**
 * Heading row for app sections: serif title on a hairline, with an optional
 * "see all" link on the right.
 */
export function SectionHeader({
  id,
  title,
  href,
  linkLabel,
}: {
  id?: string;
  title: string;
  href?: string;
  linkLabel?: string;
}) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4 border-b border-border/70 pb-3">
      <h2 id={id} className="font-serif text-2xl font-semibold sm:text-3xl">
        {title}
      </h2>
      {href && linkLabel ? (
        <Link
          href={href}
          className="group inline-flex shrink-0 items-center gap-1 py-1 text-sm font-medium text-primary transition-colors hover:text-primary/80"
        >
          {linkLabel}
          <ArrowRight
            className="size-4 transition-transform duration-(--duration-fast) group-hover:translate-x-0.5"
            aria-hidden="true"
          />
        </Link>
      ) : null}
    </div>
  );
}
