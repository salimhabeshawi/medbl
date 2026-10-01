"use client"

import * as React from "react"
import { cn } from "cn"
import Link, { useLinkStatus } from "next/link"

import { Button } from "@/components/ui/button"
import { LoadingSpinner } from "@/components/loading-spinner"
import { ChevronLeftIcon, ChevronRightIcon, MoreHorizontalIcon } from "lucide-react"

function Pagination({ className, ...props }: React.ComponentProps<"nav">) {
  return (
    <nav
      role="navigation"
      aria-label="pagination"
      data-slot="pagination"
      className={cn("mx-auto flex w-full justify-center", className)}
      {...props}
    />
  )
}

function PaginationContent({
  className,
  ...props
}: React.ComponentProps<"ul">) {
  return (
    <ul
      data-slot="pagination-content"
      className={cn("flex items-center gap-0.5", className)}
      {...props}
    />
  )
}

function PaginationItem({ ...props }: React.ComponentProps<"li">) {
  return <li data-slot="pagination-item" {...props} />
}

// `href` stays optional on purpose: a disabled page control (first page's
// "Previous", last page's "Next") is rendered WITHOUT an href so it is not
// navigable at all, rather than pointing somewhere inert. That is why the
// disabled branch below renders a <span> instead of a <Link> — an <a> always
// needs an href, and `next/link` types it as required.
type PaginationLinkProps = {
  isActive?: boolean
  href?: string
  className?: string
  children?: React.ReactNode
  "aria-label"?: string
  "aria-disabled"?: boolean | "false" | "true"
} & Pick<React.ComponentProps<typeof Button>, "size">

/**
 * Swaps a page link's content for the app's standard LoadingSpinner while the
 * navigation it triggered is still in flight.
 *
 * `useLinkStatus` only reports state for links inside a <Link>, so this has to
 * be a descendant of one — which is exactly where the link's children are.
 * Without it, clicking page 3 left the button looking completely inert until
 * the new page painted, which reads as a dead button on a slow connection.
 * `app/poems/loading.tsx` covers the content area; this covers the control.
 */
function LinkPending({ children }: { children: React.ReactNode }) {
  const { pending } = useLinkStatus()
  if (!pending) return <>{children}</>
  return <LoadingSpinner />
}

function PaginationLink({
  className,
  isActive,
  size = "icon",
  children,
  href,
  ...props
}: PaginationLinkProps) {
  const content = <LinkPending>{children}</LinkPending>

  return (
    <Button
      asChild
      variant={isActive ? "outline" : "ghost"}
      size={size}
      className={cn(className)}
    >
      {href ? (
        <Link
          href={href}
          aria-current={isActive ? "page" : undefined}
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        >
          {content}
        </Link>
      ) : (
        <span
          data-slot="pagination-link"
          data-active={isActive}
          {...props}
        >
          {content}
        </span>
      )}
    </Button>
  )
}

function PaginationPrevious({
  className,
  text = "Previous",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to previous page"
      size="default"
      className={cn("pl-1.5!", className)}
      {...props}
    >
      <ChevronLeftIcon data-icon="inline-start" />
      <span className="hidden sm:block">{text}</span>
    </PaginationLink>
  )
}

function PaginationNext({
  className,
  text = "Next",
  ...props
}: React.ComponentProps<typeof PaginationLink> & { text?: string }) {
  return (
    <PaginationLink
      aria-label="Go to next page"
      size="default"
      className={cn("pr-1.5!", className)}
      {...props}
    >
      <span className="hidden sm:block">{text}</span>
      <ChevronRightIcon data-icon="inline-end" />
    </PaginationLink>
  )
}

function PaginationEllipsis({
  className,
  ...props
}: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden
      data-slot="pagination-ellipsis"
      className={cn(
        "flex size-8 items-center justify-center [&_svg:not([class*='size-'])]:size-4",
        className
      )}
      {...props}
    >
      <MoreHorizontalIcon
      />
      <span className="sr-only">More pages</span>
    </span>
  )
}

export {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
}
