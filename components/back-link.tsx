"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";

const className =
  "mb-6 inline-flex items-center gap-2 text-sm font-medium text-primary hover:underline";

export function BackLink({
  fallbackHref,
  children,
}: {
  fallbackHref: string;
  children: React.ReactNode;
}) {
  const router = useRouter();

  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const hasSameOriginReferrer = document.referrer
      ? new URL(document.referrer).origin === window.location.origin
      : false;

    if (window.history.length > 1 && hasSameOriginReferrer) {
      event.preventDefault();
      router.back();
    }
  }

  return (
    <Link href={fallbackHref} onClick={handleClick} className={className}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}

export function StaticBackLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link href={href} className={className}>
      <ArrowLeft className="size-4" aria-hidden="true" />
      <span>{children}</span>
    </Link>
  );
}
