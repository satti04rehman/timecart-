import { Rating } from "@/components/ui/rating";
import { SectionHeader } from "@/components/home/section-header";
import { Reveal } from "@/components/ui/reveal";
import { getTestimonials } from "@/lib/data";

export function Testimonials() {
  const testimonials = getTestimonials();

  return (
    <section className="container-tc py-16 lg:py-24">
      <SectionHeader
        align="center"
        eyebrow="Customer Stories"
        title="Loved by Our Community"
      />
      <div className="mt-12 grid gap-6 md:grid-cols-3">
        {testimonials.map((t, i) => (
          <Reveal key={t.author} delay={i * 100} duration={700}>
            <figure className="flex flex-col justify-between rounded-lg border border-soft-gray bg-white p-7">
              <div>
                <Rating value={t.rating} />
                <blockquote className="mt-4 leading-relaxed text-obsidian">
                  “{t.quote}”
                </blockquote>
              </div>
              <figcaption className="mt-6 border-t border-soft-gray pt-4">
                <p className="text-sm font-semibold text-obsidian">
                  {t.author}
                </p>
                <p className="text-xs text-champagne">{t.role}</p>
              </figcaption>
            </figure>
          </Reveal>
        ))}
      </div>
    </section>
  );
}