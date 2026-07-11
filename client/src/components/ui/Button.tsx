import * as React from "react"
import { cn } from "../../lib/utils"

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "default" | "outline" | "ghost" | "secondary"
  size?: "default" | "sm" | "lg" | "icon"
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = "default", size = "default", ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-xl text-sm font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary-500 disabled:pointer-events-none disabled:opacity-50",
          {
            "bg-gradient-to-r from-primary-600 to-accent-500 text-white hover:shadow-soft-lg hover:scale-[1.02] active:scale-[0.98]": variant === "default",
            "bg-primary-100 text-primary-700 hover:bg-primary-200 active:scale-[0.98]": variant === "secondary",
            "border border-primary-200 bg-background text-primary-700 hover:bg-primary-50 hover:border-primary-300 active:scale-[0.98]": variant === "outline",
            "hover:bg-primary-50 hover:text-primary-700": variant === "ghost",
            "h-10 px-4 py-2": size === "default",
            "h-9 rounded-lg px-3": size === "sm",
            "h-12 rounded-2xl px-8": size === "lg",
            "h-10 w-10": size === "icon",
          },
          className
        )}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button }
