import Link from "next/link";
import { Logo } from "@/components/brand/logo";
import { NewsletterForm } from "@/components/home/newsletter-form";
import { InstagramIcon, WhatsAppIcon, FacebookIcon } from "@/components/brand/social-icons";

const SHOP_LINKS = [
  { label: "Watches", href: "/watches" },
  { label: "Men", href: "/watches?gender=MEN" },
  { label: "Women", href: "/watches?gender=WOMEN" },
  { label: "New Arrivals", href: "/watches?sort=newest" },
  { label: "Sale", href: "/watches?onSale=1" },
];

const HELP_LINKS = [
  { label: "Contact", href: "/contact" },
  { label: "Shipping", href: "/shipping-and-delivery" },
  { label: "Returns", href: "/returns-policy" },
  { label: "Warranty", href: "/warranty-policy" },
  { label: "FAQ", href: "/faq" },
];

const COMPANY_LINKS = [
  { label: "About Us", href: "/about-us" },
  { label: "Privacy Policy", href: "/privacy-policy" },
  { label: "Terms & Conditions", href: "/terms" },
];

export function Footer() {
  return (
    <footer className="mt-20 bg-obsidian text-ivory">
      <div className="container-tc py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Logo variant="light" />
            <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory/60">
              Where Time Meets Style.
            </p>
            <p className="mt-2 text-sm leading-relaxed text-ivory/45">
              Premium watches from trusted brands, delivered to your doorstep.
            </p>
            <div className="mt-5 flex items-center gap-2">
              <a
                href="#"
                aria-label="Instagram"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-champagne hover:text-champagne"
              >
                <InstagramIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="Facebook"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-champagne hover:text-champagne"
              >
                <FacebookIcon className="h-4 w-4" />
              </a>
              <a
                href="#"
                aria-label="WhatsApp"
                className="flex h-9 w-9 items-center justify-center rounded-full border border-ivory/20 text-ivory/70 transition-colors hover:border-champagne hover:text-champagne"
              >
                <WhatsAppIcon className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Shop */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
              Shop
            </h4>
            <ul className="mt-4 space-y-2.5">
              {SHOP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Help */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
              Help
            </h4>
            <ul className="mt-4 space-y-2.5">
              {HELP_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-semibold uppercase tracking-[0.2em] text-champagne">
              Company
            </h4>
            <ul className="mt-4 space-y-2.5">
              {COMPANY_LINKS.map((link) => (
                <li key={link.href}>
                  <Link
                    href={link.href}
                    className="text-sm text-ivory/60 transition-colors hover:text-ivory"
                  >
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Newsletter */}
        <div className="mt-14 border-t border-ivory/10 pt-10">
          <div className="flex flex-col items-start justify-between gap-6 lg:flex-row lg:items-center">
            <div>
              <h3 className="font-heading text-xl text-ivory">
                Stay in the Loop
              </h3>
              <p className="mt-1 text-sm text-ivory/50">
                New arrivals, exclusive offers and collections.
              </p>
            </div>
            <div className="w-full max-w-md">
              <NewsletterForm variant="dark" />
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-ivory/10 pt-8 text-xs text-ivory/40 sm:flex-row">
          <p>© 2026 TimeCart. All rights reserved.</p>
          <p>
            Made with <span className="text-champagne">care</span> for watch
            lovers.
          </p>
        </div>
      </div>
    </footer>
  );
}