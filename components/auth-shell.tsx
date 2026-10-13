import type { ReactNode } from "react";
import { Logo } from "@/components/brand/logo";
import { Ornament } from "@/components/manuscript/ornament";

/**
 * Shared frame for /login and /signup: a manuscript sheet with the brand
 * mark, the page title and an ornament above the form, plus slots for the
 * back link and the inline error / confirmation notices.
 */
export function AuthShell({
  title,
  backLink,
  error,
  message,
  children,
}: {
  title: string;
  backLink: ReactNode;
  error?: string;
  message?: string;
  children: ReactNode;
}) {
  return (
    <div className="flex flex-1 items-center justify-center px-4 py-10 sm:py-16">
      <div className="w-full max-w-sm">
        {backLink}
        <div className="manuscript-sheet px-6 py-9 sm:px-9 sm:py-10">
          <div className="flex flex-col items-center text-center">
            <Logo variant="mark" className="h-11 text-primary" />
            <h1 className="mt-4 font-serif text-2xl font-semibold">{title}</h1>
          </div>
          <Ornament className="mx-auto mb-6 mt-4 max-w-32" />

          {error ? (
            <p
              role="alert"
              className="mb-4 rounded-md border border-destructive/30 bg-destructive/5 px-3 py-2 text-sm text-destructive"
            >
              {error}
            </p>
          ) : null}
          {message ? (
            <p
              role="status"
              className="mb-4 rounded-md border border-secondary/30 bg-secondary/10 px-3 py-2 text-sm text-secondary"
            >
              {message}
            </p>
          ) : null}

          {children}
        </div>
      </div>
    </div>
  );
}
