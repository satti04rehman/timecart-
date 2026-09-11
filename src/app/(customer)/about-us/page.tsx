import Link from "next/link";
import { AboutStory, VALUES, MILESTONES } from "@/components/static/about";

export default function AboutPage() {
  return (
    <div className="container-tc py-10 lg:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
          About TimeCart
        </p>
        <h1 className="mt-3 font-heading text-3xl text-obsidian lg:text-4xl">
          Where Time Meets Style
        </h1>
      </div>

      <div className="mt-12">
        <AboutStory />
      </div>

      <div className="mt-16 grid gap-4 sm:grid-cols-3">
        {VALUES.map((v) => (
          <div
            key={v.title}
            className="rounded-xl border border-soft-gray bg-white p-6"
          >
            <h3 className="font-heading text-lg text-obsidian">{v.title}</h3>
            <p className="mt-2 text-sm text-text-gray">{v.desc}</p>
          </div>
        ))}
      </div>

      <div className="mt-16">
        <h2 className="text-center font-heading text-2xl text-obsidian lg:text-3xl">
          Why Shoppers Choose TimeCart
        </h2>
        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {MILESTONES.map((m) => (
            <div
              key={m.title}
              className="rounded-xl bg-obsidian p-6 text-center text-ivory"
            >
              <p className="font-heading text-lg">{m.title}</p>
              <p className="mt-2 text-sm text-ivory/70">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="mt-16 rounded-2xl bg-soft-gray/50 p-10 text-center">
        <h2 className="font-heading text-2xl text-obsidian">
          Ready to find your watch?
        </h2>
        <p className="mx-auto mt-2 max-w-md text-sm text-text-gray">
          Take the Watch Finder quiz for tailored recommendations.
        </p>
        <Link
          href="/find-watch"
          className="mt-5 inline-flex items-center gap-2 rounded-full bg-obsidian px-8 py-3 text-sm font-semibold text-ivory transition-colors hover:bg-champagne hover:text-ivory"
        >
          Find My Watch →
        </Link>
      </div>
    </div>
  );
}