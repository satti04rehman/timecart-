import { Watch, Gem, Truck, Users, ShieldCheck, HeadphonesIcon } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";
import { CountUp } from "@/components/ui/count-up";

const STATS = [
  { icon: Gem, value: "10+", label: "Premium Brands" },
  { icon: Watch, value: "8", label: "Curated Categories" },
  { icon: Truck, value: "3–5 Days", label: "Nationwide Delivery" },
  { icon: Users, value: "2,000+", label: "Happy Customers" },
];

const FEATURES = [
  {
    icon: Watch,
    title: "Craftsmanship",
    text: "Precision mechanisms from the world's most respected watchmakers, built to last generations.",
  },
  {
    icon: ShieldCheck,
    title: "Authenticity",
    text: "Every timepiece is hand-checked and certified genuine before it reaches your doorstep.",
  },
  {
    icon: HeadphonesIcon,
    title: "Customer Care",
    text: "Expert guidance before, during, and after your purchase — we're always just a message away.",
  },
];

export function HouseDetails() {
  return (
    <section className="bg-white">
      <div className="container-tc py-16 lg:py-24">
        {/* Stats strip */}
        <div className="grid grid-cols-2 gap-x-8 gap-y-10 border-b border-soft-gray pb-14 sm:grid-cols-4">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 100} className="text-center">
              <s.icon
                className="mx-auto h-6 w-6 text-champagne"
                strokeWidth={1.5}
              />
              <p className="mt-5 font-heading text-3xl font-light tracking-wide text-obsidian lg:text-4xl">
                <CountUp value={s.value} />
              </p>
              <p className="mt-2 text-xs font-medium uppercase tracking-[0.2em] text-text-gray">
                {s.label}
              </p>
            </Reveal>
          ))}
        </div>

        {/* Feature panels */}
        <div className="mt-14 grid gap-10 sm:grid-cols-3 lg:mt-20">
          {FEATURES.map((f, i) => (
            <Reveal key={f.title} delay={200 + i * 120}>
              <div className="group flex flex-col items-center text-center">
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-soft-gray bg-ivory transition-colors duration-300 group-hover:border-champagne group-hover:bg-champagne/10">
                  <f.icon
                    className="h-7 w-7 text-obsidian transition-colors group-hover:text-champagne"
                    strokeWidth={1.25}
                  />
                </div>
                <h3 className="mt-6 font-heading text-lg font-normal uppercase tracking-[0.08em] text-obsidian">
                  {f.title}
                </h3>
                <p className="mt-3 max-w-xs text-sm leading-relaxed text-text-gray">
                  {f.text}
                </p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
