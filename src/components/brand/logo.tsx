import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
  variant?: "dark" | "light";
  compact?: boolean;
}

export function Logo({ className, variant = "dark", compact = false }: LogoProps) {
  const mark = (
    <svg
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("h-9 w-9", className)}
      aria-hidden="true"
    >
      <circle
        cx="20"
        cy="20"
        r="18"
        stroke={variant === "dark" ? "#111111" : "#F7F5F0"}
        strokeWidth="2"
        fill="none"
      />
      <circle
        cx="20"
        cy="20"
        r="4"
        fill={variant === "dark" ? "#111111" : "#F7F5F0"}
      />
      <line
        x1="20"
        y1="13"
        x2="20"
        y2="27"
        stroke={variant === "dark" ? "#111111" : "#F7F5F0"}
        strokeWidth="2"
        strokeLinecap="round"
      />
      <line
        x1="20"
        y1="22"
        x2="27"
        y2="24"
        stroke="#C6A15B"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );

  if (compact) {
    return <span className="inline-flex items-center">{mark}</span>;
  }

  return (
    <span className="inline-flex items-center gap-2.5">
      {mark}
      <span
        className={cn(
          "font-heading text-xl font-semibold uppercase tracking-[0.28em]",
          "hidden min-[420px]:inline",
          variant === "dark" ? "text-obsidian" : "text-ivory"
        )}
      >
        Time<span className="text-champagne">Cart</span>
      </span>
    </span>
  );
}