import * as React from "react";
import { cn } from "@/lib/utils";

const Input = React.forwardRef<
  HTMLInputElement,
  React.InputHTMLAttributes<HTMLInputElement>
>(({ className, type, ...props }, ref) => {
  return (
    <input
      type={type}
      className={cn(
        "flex h-11 w-full rounded-md border border-soft-gray bg-white px-3.5 py-2 text-sm text-obsidian placeholder:text-text-gray/60 transition-colors focus-visible:outline-none focus-visible:border-obsidian focus-visible:ring-2 focus-visible:ring-champagne/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Input.displayName = "Input";

export { Input };