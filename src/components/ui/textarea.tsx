import * as React from "react";
import { cn } from "@/lib/utils";

const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "flex min-h-[120px] w-full rounded-md border border-soft-gray bg-white px-3.5 py-2.5 text-sm text-obsidian placeholder:text-text-gray/60 transition-colors focus-visible:outline-none focus-visible:border-obsidian focus-visible:ring-2 focus-visible:ring-champagne/40 disabled:cursor-not-allowed disabled:opacity-50",
        className
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };