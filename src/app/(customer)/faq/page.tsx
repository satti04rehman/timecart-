import { FaqAccordion } from "@/components/static/faq";
import Link from "next/link";

export default function FaqPage() {
  return (
    <div className="container-tc py-10 lg:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
          Help Center
        </p>
        <h1 className="mt-3 font-heading text-3xl text-obsidian lg:text-4xl">
          Frequently Asked Questions
        </h1>
        <p className="mt-3 text-sm text-text-gray">
          Everything you need to know about ordering from TimeCart.
        </p>
      </div>

      <div className="mx-auto mt-10 max-w-2xl">
        <FaqAccordion />
      </div>

      <div className="mx-auto mt-10 max-w-2xl rounded-xl border border-soft-gray bg-white p-6 text-center">
        <p className="text-sm text-text-gray">
          Still have questions?{" "}
          <Link href="/contact" className="font-medium text-champagne hover:underline">
            Contact our team
          </Link>
        </p>
      </div>
    </div>
  );
}