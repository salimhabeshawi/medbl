import * as React from "react"
import { cn } from "cn"

export function InputGroupInput({
  className,
  placeholder,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  className?: string
  placeholder?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn(
        "flex h-10 w-full items-center rounded-md border border-input bg-transparent px-3 pb-2 pr-8 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/50 dark:bg-input/30 dark:text-foreground",
        className
      )}
      {...props}
    >
      {placeholder && (
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground pointer-events-none">{placeholder}</span>
      )}
      {children}
    </div>
  )
}

export function InputGroupAddon({
  className,
  children,
  align = "end",
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  className?: string
  children?: React.ReactNode
  align?: "start" | "end"
}) {
  return (
    <div
      className={cn(
        "absolute right-2 select-none flex h-full items-center pointer-events-none",
        align === "start" && "left-2",
        className
      )}
    >
      {children}
    </div>
  )
}

export function InputGroup({
  className,
  children,
  ...props
}: React.ComponentPropsWithoutRef<"div"> & {
  className?: string
  children?: React.ReactNode
}) {
  return (
    <div
      className={cn("relative flex h-10 w-full items-center", className)}
    >
      {children}
    </div>
  )
}

InputGroup.Input = InputGroupInput
InputGroup.Addon = InputGroupAddon

export default InputGroup