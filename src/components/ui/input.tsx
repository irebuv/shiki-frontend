import * as React from "react"

import { cn } from "@/lib/utils"

type InputVariant = "default" | "header" | "soft" | "ghost"

type InputProps = React.ComponentProps<"input"> & {
  error?: boolean
  variant?: InputVariant
}

const inputVariantClasses: Record<InputVariant, string> = {
  default:
    "border-input bg-background/80 text-foreground placeholder:text-muted-foreground focus-visible:border-ring focus-visible:ring-ring/35",
  header:
    "border-input-header-border bg-input-header-bg text-input-header-text placeholder:text-input-header-placeholder focus-visible:border-input-header-focus-border focus-visible:ring-input-header-focus-ring",
  soft:
    "border-input-soft-border bg-input-soft-bg text-input-soft-text placeholder:text-input-soft-placeholder focus-visible:border-input-soft-focus-border focus-visible:ring-input-soft-focus-ring",
  ghost:
    "border-transparent bg-transparent text-foreground placeholder:text-muted-foreground focus-visible:border-ring/70 focus-visible:ring-ring/25",
}

function Input({ className, type, error, variant = "default", ...props }: InputProps) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "file:text-foreground selection:bg-primary selection:text-primary-foreground h-9 w-full min-w-0 rounded-md border px-3 py-1 text-base shadow-xs transition-[color,box-shadow,border-color,background-color] outline-none file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm overflow-x-auto",
        "focus-visible:ring-[3px]",
        "aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 aria-invalid:border-destructive",
        inputVariantClasses[variant],
        error && "border-destructive bg-destructive/5 focus-visible:ring-destructive/25",
        className
      )}
      {...props}
    />
  )
}

export { Input }
