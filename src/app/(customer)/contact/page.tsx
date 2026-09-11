import { ContactForm } from "@/components/contact/contact-form";
import { Phone, Mail, MessageCircle, MapPin } from "lucide-react";

const CHANNELS = [
  { icon: Phone, title: "Call Us", desc: "+92 300 1234567", note: "Mon–Sat, 10am–7pm" },
  { icon: Mail, title: "Email", desc: "support@timecart.pk", note: "Replies within 24h" },
  { icon: MessageCircle, title: "WhatsApp", desc: "+92 300 1234567", note: "Fastest response" },
  { icon: MapPin, title: "Visit Us", desc: "Gulshan-e-Iqbal, Karachi", note: "By appointment" },
];

export default function ContactPage() {
  return (
    <div className="container-tc py-10 lg:py-14">
      <div className="mx-auto max-w-2xl text-center">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-champagne">
          Contact Us
        </p>
        <h1 className="mt-3 font-heading text-3xl text-obsidian lg:text-4xl">
          We're Here to Help
        </h1>
        <p className="mt-3 text-sm text-text-gray lg:text-base">
          Questions about an order, a product or a payment? Reach out and
          our team will get back to you quickly.
        </p>
      </div>

      <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {CHANNELS.map((c) => (
          <div
            key={c.title}
            className="rounded-xl border border-soft-gray bg-white p-5 text-center"
          >
            <c.icon className="mx-auto h-6 w-6 text-champagne" />
            <p className="mt-3 text-sm font-semibold text-obsidian">
              {c.title}
            </p>
            <p className="mt-0.5 text-sm text-text-gray">{c.desc}</p>
            <p className="mt-0.5 text-xs text-text-gray">{c.note}</p>
          </div>
        ))}
      </div>

      <div className="mt-12 grid gap-10 lg:grid-cols-[1fr_380px]">
        <div className="rounded-xl border border-soft-gray bg-white p-6">
          <h2 className="font-heading text-xl text-obsidian">Send a Message</h2>
          <div className="mt-5">
            <ContactForm />
          </div>
        </div>

        <aside className="h-fit space-y-4">
          <div className="rounded-xl bg-obsidian p-6 text-ivory">
            <h3 className="font-heading text-lg">Delivery Support</h3>
            <p className="mt-2 text-sm text-ivory/70">
              Orders typically arrive within 3–5 working days after
              verification. Track your order anytime.
            </p>
          </div>
          <div className="rounded-xl border border-soft-gray bg-white p-6">
            <h3 className="font-heading text-lg text-obsidian">
              Before you ask
            </h3>
            <ul className="mt-3 space-y-2 text-sm text-text-gray">
              <li>• Track an order with your order number on the Track page.</li>
              <li>• Returns are accepted within 7 days of delivery.</li>
              <li>• COD is available for orders up to Rs. 60,000.</li>
              <li>• Share bank transfer slips with your order number.</li>
            </ul>
          </div>
        </aside>
      </div>
    </div>
  );
}