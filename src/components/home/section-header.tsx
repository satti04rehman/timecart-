import Link from "next/link";
import { cn } from "@/lib/utils";
import { Reveal } from "@/components/ui/reveal";

interface SectionHeaderProps {
  eyebrow?: string;
  title: string;
  subtitle?: string;
  href?: string;
  linkLabel?: string;
  align?: "left" | "center";
  dark?: boolean;
}

export function SectionHeader({
  eyebrow,
  title,
  subtitle,
  href,
  linkLabel = "View all",
  align = "left",
  dark = false,
}: SectionHeaderProps) {
  return (
    <Reveal
      className={cn(
        "flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between",
        align === "center" && "sm:flex-col sm:items-center sm:text-center"
      )}
    >
      <div>
        {eyebrow && (
          <p className="text-xs font-light uppercase tracking-[0.35em] text-champagne">
            {eyebrow}
          </p>
        )}
        <h2
          className={cn(
            "mt-3 font-heading font-light tracking-wide text-3xl lg:text-[40px] lg:leading-tight",
            dark ? "text-ivory" : "text-obsidian"
          )}
        >
          {title}
        </h2>
        {subtitle && (
          <p
            className={cn(
              "mt-3 max-w-xl text-sm lg:text-base",
              dark ? "text-ivory/60" : "text-text-gray"
            )}
          >
            {subtitle}
          </p>
        )}
      </div>
      {href && align !== "center" && (
        <Link
          href={href}
          className={cn(
            "inline-flex min-h-11 shrink-0 items-center gap-2 py-2 text-sm font-semibold uppercase tracking-wider transition-colors",
            dark
              ? "text-champagne hover:text-ivory"
              : "text-obsidian hover:text-champagne"
          )}
        >
          {linkLabel}
          <span aria-hidden="true">→</span>
        </Link>
      )}
    </Reveal>
  );
}