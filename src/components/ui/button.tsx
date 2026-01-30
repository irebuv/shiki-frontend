import { cn } from "@/lib/utils";
import * as React from "react";

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
    variant?: "default" | "outline" | "ghost" | "solid" | "filter" | "clear" | "toggle";
    size?: "sm" | "md" | "lg";
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ className, variant = "default", size = "md", ...props }, ref) => {
        const baseStyles =
            "inline-flex items-center cursor-pointer justify-center rounded-xl font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none";

        const variants = {
            default: "bg-chart-1 text-white hover:bg-neutral-800",
            outline: "border border-neutral-300 hover:bg-neutral-100",
            ghost: "hover:bg-neutral-100 text-neutral-800",
            solid: "bg-violet-600 text-white hover:bg-violet-700",
            filter: "admin-filters-toggle",
            clear: "rounded-full border border-danger-border bg-danger/80 px-3 py-1 text-xs font-semibold uppercase text-danger-fg hover:bg-danger-hover hover:text-chart-2",
            toggle: "rounded-full border border-chart-2 bg-chart-3/80 dark:bg-chart-3/50 px-3 py-1 text-xs font-semibold uppercase text-chart-2 hover:bg-chart-2/80 hover:text-chart-3",
        };

        const sizes = {
            sm: "h-8 px-3 text-sm",
            md: "h-10 px-4 text-sm",
            lg: "h-12 px-6 text-base",
        };

        const sizeClass =
            variant === "clear" || variant === "toggle" ? "" : sizes[size];

        return (
            <button
                ref={ref}
                className={cn(baseStyles, variants[variant], sizeClass, className)}
                {...props}
            />
        );
    }
);

Button.displayName = "Button";
