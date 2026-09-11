import { Truck, Banknote, ShieldCheck, Headphones } from "lucide-react";
import { Reveal } from "@/components/ui/reveal";

const PERKS = [
  {
    icon: Truck,
    title: "Free Shipping",
    description: "On all orders above Rs. 10,000",
  },
  {
    icon: Banknote,
    title: "Pay on Delivery",
    description: "Cash or bank transfer",
  },
  {
    icon: ShieldCheck,
    title: "100% Authentic",
    description: "Genuine watches, guaranteed",
  },
  {
    icon: Headphones,
    title: "24/7 Support",
    description: "We're here, any time",
  },
];

export function Benefits() {
  return (
    <section className="border-y border-soft-gray/70 bg-white">
      <div className="container-tc">
        <div className="grid grid-cols-2 divide-soft-gray/70 lg:grid-cols-4 lg:divide-x">
          {PERKS.map((perk, i) => (
            <Reveal key={perk.title} delay={i * 90} duration={600}>
              <div className="flex items-center gap-4 px-4 py-8 lg:px-8">
                <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-obsidian text-champagne">
                  <perk.icon className="h-5 w-5" />
                </span>
                <div>
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-obsidian">
                    {perk.title}
                  </h3>
                  <p className="mt-1 text-xs text-text-gray">
                    {perk.description}
                  </p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}