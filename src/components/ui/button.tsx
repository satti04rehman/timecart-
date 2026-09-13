import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-md text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-champagne/60 disabled:pointer-events-none disabled:opacity-50 cursor-pointer select-none",
  {
    variants: {
      variant: {
        primary:
          "bg-obsidian text-ivory hover:bg-obsidian/85 hover:shadow-lg hover:shadow-obsidian/10",
        champagne:
          "bg-champagne text-obsidian hover:bg-champagne/85 shadow-lg shadow-champagne/10",
        outline:
          "border border-obsidian/20 bg-transparent text-obsidian hover:border-obsidian hover:bg-obsidian hover:text-ivory",
        ghost: "bg-transparent text-obsidian hover:bg-soft-gray/70",
        light:
          "bg-ivory text-obsidian hover:bg-white hover:shadow-lg hover:shadow-obsidian/10",
        dark: "bg-white/10 text-white border border-white/20 hover:bg-white/20 backdrop-blur-sm",
        link: "text-champagne underline-offset-4 hover:underline bg-transparent",
      },
      size: {
        default: "h-11 px-6",
        sm: "h-10 px-4 text-xs",
        lg: "h-14 px-8 text-[15px]",
        icon: "h-11 w-11",
        "icon-sm": "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "primary",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button";
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    );
  }
);
Button.displayName = "Button";

export { Button, buttonVariants };