import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:size-4 [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default: "bg-gray-900 text-white hover:bg-gray-800",
        destructive:
          "bg-destructive text-destructive-foreground hover:bg-destructive/90",
        outline:
          "border border-gray-300 bg-white text-gray-900 hover:bg-gray-50",
        secondary:
          "bg-gray-100 text-gray-900 hover:bg-gray-200",
        ghost: "hover:bg-gray-100 text-gray-900",
        link: "text-gray-900 underline-offset-4 hover:underline",
        linktree: "bg-step-pink text-gray-900 hover:bg-step-lavender rounded-full font-semibold",
        accent: "bg-step-teal text-gray-900 hover:bg-step-mint rounded-full",
        // Regular gamified variants with better contrast
        gamify: "bg-step-yellow text-gray-900 hover:bg-step-peach font-semibold",
        celebration: "bg-step-pink text-gray-900 hover:bg-step-lavender font-bold",
        pastel: "bg-step-mint text-gray-900 hover:bg-step-teal",
        success: "bg-green-500 text-white hover:bg-green-600",
        teal: "bg-step-teal text-gray-900 hover:bg-step-mint",
        mint: "bg-step-mint text-gray-900 hover:bg-step-peach",
        // 3D Gameified variants
        "gameified-primary": "bg-step-pink text-gray-900 hover:bg-step-lavender font-semibold btn-gameified btn-gameified-pink rounded-lg",
        "gameified-secondary": "bg-step-teal text-gray-900 hover:bg-step-mint font-semibold btn-gameified btn-gameified-teal rounded-lg",
        "gameified-accent": "bg-step-yellow text-gray-900 hover:bg-step-peach font-semibold btn-gameified btn-gameified-yellow rounded-lg",
        "gameified-success": "bg-step-mint text-gray-900 hover:bg-step-teal font-semibold btn-gameified btn-gameified-mint rounded-lg",
        "gameified-outline": "border-2 border-step-pink bg-white text-gray-900 hover:bg-step-pink/10 font-semibold btn-gameified btn-gameified-pink rounded-lg",
        // TapBookr green variants
        "tapbookr": "bg-tapbookr-green text-tapbookr-green-foreground hover:bg-tapbookr-green-dark font-semibold",
        "tapbookr-outline": "border-2 border-tapbookr-green bg-transparent text-tapbookr-green hover:bg-tapbookr-green hover:text-tapbookr-green-foreground",
        "tapbookr-subtle": "bg-tapbookr-green-subtle text-tapbookr-green hover:bg-tapbookr-green-light",
      },
      size: {
        default: "h-10 px-4 py-2",
        sm: "h-9 rounded-md px-3",
        lg: "h-11 rounded-md px-8",
        xl: "h-14 rounded-lg px-12 text-lg font-bold",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
