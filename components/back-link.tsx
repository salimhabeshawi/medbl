import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export function BackLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline"
    >
      <ArrowLeft className="size-4" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}
