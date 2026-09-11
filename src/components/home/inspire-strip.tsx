import Image from "next/image";
import Link from "next/link";
import { InstagramIcon } from "@/components/home/collection-cards";
import { SectionHeader } from "@/components/home/section-header";

const IMAGES = [
  "inspire-1",
  "inspire-2",
  "inspire-3",
  "inspire-4",
  "inspire-5",
  "inspire-6",
];

export function InspireStrip() {
  return (
    <section className="border-t border-soft-gray bg-white py-16 lg:py-24">
      <div className="container-tc">
        <SectionHeader
          align="center"
          eyebrow="@timecart"
          title="Your Wrist, Your Story"
          subtitle="Tag us on Instagram for a chance to be featured."
        />
        <div className="mt-10 grid grid-cols-3 gap-3 sm:grid-cols-6 lg:gap-4">
          {IMAGES.map((seed, i) => (
            <Link
              key={seed}
              href="/watches"
              aria-label="Follow our Instagram for inspiration"
              className="group relative block aspect-square overflow-hidden rounded-lg bg-soft-gray"
            >
              <Image
                src={`/images/home/${seed}.svg`}
                alt=""
                fill
                loading="lazy"
                sizes="(min-width:640px) 16vw, 33vw"
                className="object-cover transition-all duration-500 group-hover:scale-110 group-hover:opacity-90"
              />
              <span className="absolute inset-0 flex items-center justify-center bg-obsidian/0 transition-colors duration-500 group-hover:bg-obsidian/40">
                <InstagramIcon className="h-8 w-8 text-white opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}