import { cn } from "@/lib/utils";
import { Gem, Ship, RotateCcw, ShieldCheck, Star } from "lucide-react";

const ITEMS = [
  { icon: ShieldCheck, label: "AUTHENTIC BRANDS ONLY" },
  { icon: Ship, label: "FREE SHIPPING OVER RS. 10,000" },
  { icon: RotateCcw, label: "7-DAY EASY RETURNS" },
  { icon: Gem, label: "GENUINE CRAFTSMANSHIP" },
  { icon: Star, label: "RATED 4.8/5 BY 2,000+ CUSTOMERS" },
] as const;

export function Marquee({ className }: { className?: string }) {
  const Row = () => (
    <div className="flex shrink-0 items-center" aria-hidden="true">
      {ITEMS.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="flex items-center gap-3 whitespace-nowrap px-6 text-xs font-medium uppercase tracking-[0.22em] text-ivory/80 md:px-8"
        >
          <Icon className="h-3.5 w-3.5 text-champagne" strokeWidth={1.75} />
          {label}
        </span>
      ))}
    </div>
  );

  return (
    <div
      className={cn(
        "marquee-paused overflow-hidden bg-obsidian py-3.5 ring-1 ring-champagne/25",
        className
      )}
    >
      <div className="flex w-max animate-marquee">
        <Row />
        <Row />
      </div>
    </div>
  );
}