import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"
import { Slot } from "radix-ui"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-2 rounded-xl font-semibold transition-colors disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-5",
  {
    variants: {
      variant: {
        default: "bg-sedra-green text-white hover:bg-sedra-green-800",
        destructive: "bg-destructive text-white hover:bg-destructive/90",
        outline:
          "border-2 border-sedra-green bg-white text-sedra-green hover:bg-sedra-pale-50",
        secondary: "bg-sedra-pale-100 text-ink hover:bg-sedra-pale",
        ghost: "text-ink hover:bg-sedra-pale-50",
        link: "text-sedra-green underline underline-offset-4 hover:no-underline",
      },
      // Brief §3: primary controls at least 48x48 CSS px; 8px spacing between targets.
      size: {
        default: "min-h-12 px-5 py-2 text-base has-[>svg]:px-4",
        sm: "min-h-12 gap-1.5 px-4 text-base has-[>svg]:px-3",
        lg: "min-h-14 px-7 text-lg has-[>svg]:px-6",
        icon: "size-12",
        "icon-sm": "size-12",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant = "default",
  size = "default",
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & {
    asChild?: boolean
  }) {
  const Comp = asChild ? Slot.Root : "button"

  return (
    <Comp
      data-slot="button"
      data-variant={variant}
      data-size={size}
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
