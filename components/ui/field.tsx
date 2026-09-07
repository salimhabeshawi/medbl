import * as React from "react"
import { cn } from "cn"

export function FieldLabel({
  htmlFor,
  className,
  ...props
}: React.LabelHTMLAttributes<HTMLLabelElement> & {
  className?: string
}) {
  return (
    <label htmlFor={htmlFor} className={cn("block text-sm font-medium text-foreground mb-1", className)} {...props} />
  )
}

export function FieldDescription({
  className,
  ...props
}: React.HTMLAttributes<HTMLParagraphElement> & {
  className?: string
}) {
  return (
    <p className={cn("text-sm text-muted-foreground", className)} {...props} />
  )
}

function Field({
  className,
  ...props
}: React.HTMLAttributes<HTMLDivElement> & {
  className?: string
}) {
  return <div className={cn("space-y-1", className)} {...props} />
}

export { Field }

Field.Label = FieldLabel
Field.Description = FieldDescription

export default Field