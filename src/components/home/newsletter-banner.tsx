import { NewsletterForm } from "@/components/home/newsletter-form";

export function NewsletterBanner() {
  return (
    <section className="border-t border-soft-gray bg-soft-gray/40">
      <div className="container-tc">
        <div className="mx-auto max-w-xl py-16 text-center">
          <p className="text-xs font-semibold uppercase tracking-[0.35em] text-champagne">
            Newsletter
          </p>
          <h2 className="mt-4 font-heading text-3xl sm:text-4xl">
            Stay in the Loop
          </h2>
          <p className="mt-3 text-text-gray">
            Get updates about new arrivals, exclusive offers and collections.
          </p>
          <div className="mx-auto mt-8 max-w-md">
            <NewsletterForm />
          </div>
        </div>
      </div>
    </section>
  );
}