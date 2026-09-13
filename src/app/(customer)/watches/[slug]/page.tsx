import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { ChevronRight, Truck, RotateCcw, ShieldCheck, CreditCard, CheckCircle2, Info } from "lucide-react";
import { ProductGallery } from "@/components/product/product-gallery";
import { ProductActions } from "@/components/product/product-actions";
import { ProductTabs } from "@/components/product/product-tabs";
import { ProductRail } from "@/components/product/product-rail";
import { SectionHeader } from "@/components/home/section-header";
import { Rating } from "@/components/ui/rating";
import { Badge } from "@/components/ui/badge";
import { getProductBySlug, getRelatedProducts, getProductReviews } from "@/lib/data";
import { prisma } from "@/lib/prisma";
import { cn, formatPrice } from "@/lib/utils";

export const revalidate = 60;

export async function generateStaticParams() {
  try {
    const products = await prisma.product.findMany({
      where: { isActive: true },
      select: { slug: true },
    });
    return products.map((product) => ({ slug: product.slug }));
  } catch {
    return [];
  }
}

interface ProductPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({
  params,
}: ProductPageProps): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product)
    return { title: "Watch Not Found | TimeCart" };
  return {
    title: `${product.name} | TimeCart`,
    description: product.description ?? `${product.name} — ${product.brand.name}`,
  };
}

const BENEFITS = [
  { icon: Truck, label: "Cash on Delivery", sub: "Available nationwide" },
  { icon: RotateCcw, label: "7-Day Returns", sub: "No questions asked" },
  { icon: ShieldCheck, label: "Brand Warranty", sub: "Full manufacturer cover" },
  { icon: CreditCard, label: "Pay via Card", sub: "Visa / MasterCard / JCB" },
];

export default async function ProductPage({ params }: ProductPageProps) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) notFound();

  const [related, reviews] = await Promise.all([
    getRelatedProducts(product),
    getProductReviews(product.id),
  ]);
  const reviewsData = reviews.map((r) => ({
    ...r,
    date: r.date instanceof Date ? r.date.toISOString() : r.date,
  }));

  const specRows = product.specifications
    ? Object.entries(product.specifications).map(([label, value]) => ({
        label,
        value,
      }))
    : [
        { label: "Brand", value: product.brand.name },
        { label: "Movement", value: product.movement ?? "Quartz" },
        { label: "Strap Material", value: product.strapMaterial ?? "—" },
        { label: "Case Material", value: product.caseMaterial ?? "—" },
        { label: "Case Diameter", value: product.caseDiameter ?? "—" },
        { label: "Water Resistance", value: product.waterResistance ?? "—" },
        { label: "Display Type", value: product.displayType ?? "—" },
        { label: "Warranty", value: product.warranty ?? "1 Year" },
        { label: "Occasion", value: product.occasion ?? "Everyday" },
      ];

  const outOfStock = product.stock <= 0;
  const lowStock = !outOfStock && product.stock <= 5;

  const sidebarSpecs = specRows
    .filter((s) =>
      ["Movement", "Case Material", "Case Diameter", "Strap Material", "Water Resistance", "Warranty"].includes(
        s.label
      )
    )
    .slice(0, 6);

  return (
    <div className="container-tc py-8 lg:py-12">
      {/* Breadcrumbs */}
      <nav className="mb-6 flex flex-wrap items-center gap-1.5 text-xs text-text-gray" aria-label="Breadcrumb">
        <Link href="/" className="hover:text-champagne">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href="/watches" className="hover:text-champagne">Watches</Link>
        <ChevronRight className="h-3 w-3" />
        <Link href={`/watches?category=${product.category.slug}`} className="hover:text-champagne">
          {product.category.name}
        </Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-obsidian">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_420px] lg:gap-14">
        {/* Gallery */}
        <ProductGallery images={product.images} />

        {/* Details & availability sidebar */}
        <div className="lg:sticky lg:top-24 lg:self-start">
          <div className="rounded-2xl border border-soft-gray bg-white p-7 shadow-sm shadow-obsidian/5">
            <Link
              href={`/watches?brand=${product.brand.slug}`}
              className="text-xs font-medium uppercase tracking-[0.25em] text-champagne hover:underline"
            >
              {product.brand.name}
            </Link>
            <h1 className="mt-2 font-heading text-2xl font-light tracking-wide text-obsidian lg:text-[28px]">
              {product.name}
            </h1>

            <div className="mt-3 flex items-center gap-3">
              <Rating value={product.ratingAvg} showValue />
              <span className="text-sm text-text-gray">
                ({product.ratingCount} reviews)
              </span>
            </div>

            {/* Availability */}
            <div className="mt-6 flex flex-wrap items-center gap-3 rounded-xl border border-soft-gray bg-ivory px-4 py-3">
              <span
                className={cn(
                  "inline-flex h-2 w-2 rounded-full",
                  outOfStock ? "bg-red-500" : lowStock ? "bg-amber-500" : "bg-green-600"
                )}
                aria-hidden="true"
              />
              <p className="text-sm">
                {outOfStock ? (
                  <span className="font-medium text-obsidian">Out of stock</span>
                ) : lowStock ? (
                  <span className="font-medium text-obsidian">
                    Low stock — {product.stock} remaining
                  </span>
                ) : (
                  <span className="font-medium text-obsidian">
                    In stock — {product.stock} available
                  </span>
                )}
              </p>
            </div>

            <div className="mt-6 flex items-baseline gap-3">
              <span className="font-heading text-3xl font-light text-obsidian">
                {formatPrice(product.salePrice)}
              </span>
              {product.discount > 0 && (
                <>
                  <span className="text-lg text-text-gray line-through">
                    {formatPrice(product.price)}
                  </span>
                  <Badge variant="sale">{Math.round(product.discount)}% OFF</Badge>
                </>
              )}
            </div>

            <p className="mt-1 text-xs text-text-gray">SKU: {product.sku}</p>

            <div className="my-6 h-px bg-soft-gray" />

            <ProductActions product={product} />

            {outOfStock && (
              <div className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                This watch is currently out of stock. Check back soon or add it
                to your wishlist to get notified.
              </div>
            )}

            <div className="mt-6 space-y-2">
              <p className="flex items-start gap-2 text-sm text-text-gray">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
                Order before 4 PM for same-day dispatch.
              </p>
              <p className="flex items-start gap-2 text-sm text-text-gray">
                <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-champagne" />
                Estimated delivery: 3–5 working days nationwide.
              </p>
            </div>

            {/* Sidebar details rail */}
            {sidebarSpecs.length > 0 && (
              <div className="mt-7 border-t border-soft-gray pt-6">
                <p className="flex items-center gap-2 text-[11px] font-medium uppercase tracking-[0.25em] text-text-gray">
                  <Info className="h-3.5 w-3.5 text-champagne" />
                  Key Details
                </p>
                <dl className="mt-4 space-y-3">
                  {sidebarSpecs.map((s) => (
                    <div key={s.label} className="flex items-baseline justify-between gap-4">
                      <dt className="text-xs font-light uppercase tracking-wider text-text-gray">
                        {s.label}
                      </dt>
                      <dd className="text-right text-[13px] font-medium text-obsidian">
                        {s.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              </div>
            )}

            {/* Benefits */}
            <div className="mt-7 grid grid-cols-2 gap-3 border-t border-soft-gray pt-6">
              {BENEFITS.map((b) => (
                <div key={b.label} className="flex flex-col items-center gap-1.5 text-center">
                  <b.icon className="h-5 w-5 text-champagne" strokeWidth={1.5} />
                  <p className="text-xs font-semibold text-obsidian">{b.label}</p>
                  <p className="text-[11px] leading-tight text-text-gray">{b.sub}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="mt-14">
        <ProductTabs
          description={product.description}
          specRows={specRows}
          specsRaw={product.specifications}
          reviews={reviewsData}
          ratingAvg={product.ratingAvg}
          ratingCount={product.ratingCount}
          productId={product.id}
          productName={product.name}
        />
      </div>

      {/* Related */}
      {related.length > 0 && (
        <div className="mt-16">
          <SectionHeader
            eyebrow="Complete your look"
            title="You May Also Like"
            href="/watches"
          />
          <div className="mt-8">
            <ProductRail products={related} columns={4} />
          </div>
        </div>
      )}
    </div>
  );
}