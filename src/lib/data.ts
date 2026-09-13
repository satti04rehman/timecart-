import { prisma, getPrismaClient } from "@/lib/prisma";
import {
  DEMO_BRANDS,
  DEMO_CATEGORIES,
  DEMO_PRODUCTS,
  DEMO_REVIEWS,
  DEMO_TESTIMONIALS,
} from "@/lib/demo-data";
import type {
  BrandSummary,
  CategorySummary,
  CouponSummary,
  ProductDetail,
  ProductFilters,
  ProductSummary,
} from "@/types";

let dbReadyPromise: Promise<boolean> | null = null;

export function isDbReady(): Promise<boolean> {
  const client = getPrismaClient();
  if (!client) return Promise.resolve(false);
  if (!dbReadyPromise) {
    dbReadyPromise = client
      .$queryRaw`SELECT 1`
      .then(() => true)
      .catch(() => false);
  }
  return dbReadyPromise;
}

export async function getDb(): Promise<boolean> {
  return isDbReady();
}

// ---------- Categories & Brands ----------

export async function getCategories(): Promise<(CategorySummary & {
  productCount: number;
})[]> {
  const ready = await isDbReady();
  if (!ready) {
    const counts = new Map<string, number>();
    DEMO_PRODUCTS.forEach((p) =>
      counts.set(p.category.id, (counts.get(p.category.id) ?? 0) + 1)
    );
    return DEMO_CATEGORIES.map((c) => ({
      id: c.id,
      name: c.name,
      slug: c.slug,
      imageUrl: c.imageUrl,
      parentId: c.parentId,
      productCount: counts.get(c.id) ?? 0,
    }));
  }
  const cats = await prisma.category.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
    orderBy: { sortOrder: "asc" },
  });
  return cats.map((c) => ({
    id: c.id,
    name: c.name,
    slug: c.slug,
    imageUrl: c.imageUrl,
    parentId: c.parentId,
    productCount: c._count.products,
  }));
}

export async function getBrands(): Promise<BrandSummary[]> {
  const ready = await isDbReady();
  if (!ready) {
    return DEMO_BRANDS.map((b) => ({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logoUrl: b.logoUrl,
    }));
  }
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });
  return brands.map((b) => ({
    id: b.id,
    name: b.name,
    slug: b.slug,
    logoUrl: b.logoUrl,
  }));
}

export async function getBrandCounts(): Promise<Record<string, number>> {
  const ready = await isDbReady();
  if (!ready) {
    const counts: Record<string, number> = {};
    DEMO_PRODUCTS.forEach((p) => {
      counts[p.brand.slug] = (counts[p.brand.slug] ?? 0) + 1;
    });
    return counts;
  }
  const brands = await prisma.brand.findMany({
    where: { isActive: true },
    include: { _count: { select: { products: true } } },
  });
  return Object.fromEntries(
    brands.map((b) => [b.slug, b._count.products])
  );
}

// ---------- Products ----------

const toSummary = (p: {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  gender: "MEN" | "WOMEN" | "UNISEX";
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  imageUrl?: string | null;
  featuredImageUrl?: string | null;
  ratingAvg: number;
  ratingCount: number;
  variants?: { stock: number; stockStatus: string }[];
  isNewArrival?: boolean;
  isBestSeller?: boolean;
  colors?: unknown;
  movement?: string | null;
}): ProductSummary => {
  const stock =
    p.variants?.reduce((s, v) => s + v.stock, 0) ?? 0;
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    price: p.price,
    discount: p.discount,
    salePrice: p.price * (1 - (p.discount ?? 0) / 100),
    brand: p.brand,
    category: p.category,
    gender: p.gender,
    imageUrl: p.featuredImageUrl ?? p.imageUrl ?? null,
    ratingAvg: p.ratingAvg,
    ratingCount: p.ratingCount,
    stockStatus: stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
    stock,
    isNewArrival: p.isNewArrival ?? false,
    isBestSeller: p.isBestSeller ?? false,
    colors: (p.colors as string[]) ?? undefined,
    movement: p.movement,
  };
};

export async function getHomeProducts(): Promise<{
  newArrivals: ProductSummary[];
  bestSellers: ProductSummary[];
  featured: ProductSummary[];
  categories: (CategorySummary & { productCount: number })[];
  brands: BrandSummary[];
}> {
  const ready = await isDbReady();
  if (!ready) {
    const featured = DEMO_PRODUCTS.filter((p) => p.isFeatured).map(toSummary);
    const newArrivals = DEMO_PRODUCTS.filter((p) => p.isNewArrival).map(
      toSummary
    );
    const bestSellers = DEMO_PRODUCTS.filter((p) => p.isBestSeller).map(
      toSummary
    );
    const categories = await getCategories();
    const brands = await getBrands();
    return { newArrivals, bestSellers, featured, categories, brands };
  }

  const [featured, newArrivals, bestSellers] = await Promise.all([
    prisma.product.findMany({
      where: { isActive: true, isFeatured: true },
      take: 8,
      include: { brand: true, category: true, variants: true },
      orderBy: { ratingAvg: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isNewArrival: true },
      take: 8,
      include: { brand: true, category: true, variants: true },
      orderBy: { createdAt: "desc" },
    }),
    prisma.product.findMany({
      where: { isActive: true, isBestSeller: true },
      take: 8,
      include: { brand: true, category: true, variants: true },
      orderBy: { ratingAvg: "desc" },
    }),
  ]);

  const [categories, brands] = await Promise.all([
    getCategories(),
    getBrands(),
  ]);

  return {
    featured: featured.map((f) =>
      toSummary({
        ...f,
        price: Number(f.price),
        ratingAvg: Number(f.ratingAvg),
        brand: { id: f.brand.id, name: f.brand.name, slug: f.brand.slug },
        category: { id: f.category.id, name: f.category.name, slug: f.category.slug },
      })
    ),
    newArrivals: newArrivals.map((f) =>
      toSummary({
        ...f,
        price: Number(f.price),
        ratingAvg: Number(f.ratingAvg),
        brand: { id: f.brand.id, name: f.brand.name, slug: f.brand.slug },
        category: { id: f.category.id, name: f.category.name, slug: f.category.slug },
      })
    ),
    bestSellers: bestSellers.map((f) =>
      toSummary({
        ...f,
        price: Number(f.price),
        ratingAvg: Number(f.ratingAvg),
        brand: { id: f.brand.id, name: f.brand.name, slug: f.brand.slug },
        category: { id: f.category.id, name: f.category.name, slug: f.category.slug },
      })
    ),
    categories,
    brands,
  };
}

export async function getProducts(
  filters: ProductFilters = {}
): Promise<{ products: ProductSummary[]; total: number; page: number; pages: number }> {
  const ready = await isDbReady();

  if (!ready) {
    let list = [...DEMO_PRODUCTS];
    if (filters.category) {
      list = list.filter(
        (p) =>
          p.category.slug === filters.category ||
          p.category.id === filters.category
      );
    }
    if (filters.brand) {
      list = list.filter(
        (p) => p.brand.slug === filters.brand || p.brand.id === filters.brand
      );
    }
    if (filters.gender) {
      list = list.filter((p) => p.gender === filters.gender);
    }
    if (filters.q) {
      const q = filters.q.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.brand.name.toLowerCase().includes(q) ||
          p.category.name.toLowerCase().includes(q) ||
          p.sku.toLowerCase().includes(q)
      );
    }
    if (filters.minPrice != null) {
      list = list.filter((p) => p.salePrice >= filters.minPrice!);
    }
    if (filters.maxPrice != null) {
      list = list.filter((p) => p.salePrice <= filters.maxPrice!);
    }
    if (filters.color) {
      list = list.filter((p) => p.colors?.some((c) => c.toLowerCase().includes(filters.color!.toLowerCase())));
    }
    if (filters.movement) {
      list = list.filter(
        (p) =>
          p.movement?.toLowerCase() === filters.movement!.toLowerCase()
      );
    }
    if (filters.style) {
      list = list.filter(
        (p) =>
          p.style?.toLowerCase() === filters.style!.toLowerCase()
      );
    }
    if (filters.minRating) {
      list = list.filter((p) => p.ratingAvg >= filters.minRating!);
    }
    if (filters.inStock) {
      list = list.filter((p) => p.stock > 0);
    }
    if (filters.onSale) {
      list = list.filter((p) => p.discount > 0);
    }
    switch (filters.sort) {
      case "price-asc":
        list.sort((a, b) => a.salePrice - b.salePrice);
        break;
      case "price-desc":
        list.sort((a, b) => b.salePrice - a.salePrice);
        break;
      case "rating":
        list.sort((a, b) => b.ratingAvg - a.ratingAvg);
        break;
      case "discount":
        list.sort((a, b) => b.discount - a.discount);
        break;
      case "newest":
        list.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        break;
      default:
        list.sort((a, b) =>
          (b.isBestSeller ? 1 : 0) - (a.isBestSeller ? 1 : 0)
        );
    }
    const page = filters.page ?? 1;
    const perPage = 12;
    const total = list.length;
    const pages = Math.max(1, Math.ceil(total / perPage));
    const products = list.slice((page - 1) * perPage, page * perPage);
    return { products, total, page, pages };
  }

  const page = filters.page ?? 1;
  const perPage = 12;
  const orderBy: Record<string, string> = {};
  switch (filters.sort) {
    case "price-asc":
      orderBy.price = "asc";
      break;
    case "price-desc":
      orderBy.price = "desc";
      break;
    case "rating":
      orderBy.ratingAvg = "desc";
      break;
    case "discount":
      orderBy.discount = "desc";
      break;
    case "newest":
      orderBy.createdAt = "desc";
      break;
    default:
      orderBy.ratingAvg = "desc";
  }

  const where: Record<string, unknown> = { isActive: true };
  if (filters.category) where.category = { slug: filters.category };
  if (filters.brand) where.brand = { slug: filters.brand };
  if (filters.gender) where.gender = filters.gender;
  if (filters.q) where.OR = [
    { name: { contains: filters.q, mode: "insensitive" } },
    { sku: { contains: filters.q, mode: "insensitive" } },
    { brand: { name: { contains: filters.q, mode: "insensitive" } } },
  ];
  if (filters.minPrice != null && filters.maxPrice != null) {
    where.price = { gte: filters.minPrice, lte: filters.maxPrice };
  } else if (filters.minPrice != null) {
    where.price = { gte: filters.minPrice };
  } else if (filters.maxPrice != null) {
    where.price = { lte: filters.maxPrice };
  }
  if (filters.movement) where.movement = filters.movement;
  if (filters.style) where.style = filters.style;
  if (filters.minRating) where.ratingAvg = { gte: filters.minRating };
  if (filters.inStock)
    where.variants = { some: { stock: { gt: 0 } } };
  if (filters.onSale) where.discount = { gt: 0 };

  const [items, total] = await Promise.all([
    prisma.product.findMany({
      where,
      skip: (page - 1) * perPage,
      take: perPage,
      include: {
        brand: true,
        category: true,
        variants: { select: { stock: true, stockStatus: true } },
      },
      orderBy,
    }),
    prisma.product.count({ where }),
  ]);

  return {
    products: items.map((p) =>
      toSummary({
        ...p,
        price: Number(p.price),
        ratingAvg: Number(p.ratingAvg),
        brand: { id: p.brand.id, name: p.brand.name, slug: p.brand.slug },
        category: { id: p.category.id, name: p.category.name, slug: p.category.slug },
      })
    ),
    total,
    page,
    pages: Math.max(1, Math.ceil(total / perPage)),
  };
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetail | null> {
  const ready = await isDbReady();
  if (!ready) {
    return DEMO_PRODUCTS.find((p) => p.slug === slug) ?? null;
  }
  let p;
  try {
    p = await prisma.product.findUnique({
      where: { slug },
      include: {
        brand: true,
        category: true,
        variants: true,
        images: { orderBy: { sortOrder: "asc" } },
      },
    });
  } catch {
    return null;
  }
  if (!p) return null;

  const stockTotal = p.variants.reduce((s, v) => s + v.stock, 0);
  return {
    id: p.id,
    slug: p.slug,
    name: p.name,
    sku: p.sku,
    price: Number(p.price),
    discount: p.discount,
    salePrice: Number(p.price) * (1 - p.discount / 100),
    brand: p.brand,
    category: p.category,
    gender: p.gender,
    imageUrl: p.featuredImageUrl,
    ratingAvg: Number(p.ratingAvg),
    ratingCount: p.ratingCount,
    stockStatus: stockTotal > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
    stock: stockTotal,
    isNewArrival: p.isNewArrival,
    isBestSeller: p.isBestSeller,
    colors: (p.colors as string[]) ?? undefined,
    movement: p.movement,
    description: p.description,
    strapMaterial: p.strapMaterial,
    caseMaterial: p.caseMaterial,
    caseDiameter: p.caseDiameter,
    waterResistance: p.waterResistance,
    warranty: p.warranty,
    displayType: p.displayType,
    occasion: p.occasion,
    style: p.style,
    specifications: (p.specifications as Record<string, string>) ?? null,
    images: p.images.map((i) => ({
      id: i.id,
      url: i.url,
      alt: i.alt,
      sortOrder: i.sortOrder,
    })),
    variants: p.variants.map((v) => ({
      id: v.id,
      name: v.name,
      sku: v.sku,
      color: v.color,
      size: v.size,
      price: v.price ? Number(v.price) : null,
      stock: v.stock,
      stockStatus: v.stockStatus,
      isDefault: v.isDefault,
    })),
  };
}

export async function getRelatedProducts(
  product: ProductDetail,
  limit = 4
): Promise<ProductSummary[]> {
  const { products } = await getProducts({
    category: product.category.slug,
    sort: "rating",
    page: 1,
  });
  return products.filter((p) => p.id !== product.id).slice(0, limit);
}

export async function searchSuggestions(query: string): Promise<ProductSummary[]> {
  if (!query.trim()) return [];
  const { products } = await getProducts({ q: query });
  return products.slice(0, 6);
}

export async function getPopularQueries(): Promise<string[]> {
  const ready = await isDbReady();
  if (!ready) {
    return ["Casio", "Seiko", "Men's watches", "Automatic watches", "Sports watches"];
  }
  void ready;
  return ["Casio", "Seiko", "Men's watches", "Automatic watches", "Luxury watches"];
}

// ---------- Reviews ----------

export async function getProductReviews(productId: string) {
  const ready = await isDbReady();
  if (!ready) {
    return DEMO_REVIEWS.filter((r) => r.productId === productId).map((r) => ({
      id: r.id,
      author: r.author,
      rating: r.rating,
      content: r.content,
      date: r.date,
      verified: r.verified,
    }));
  }

  const reviews = await prisma.review.findMany({
    where: { productId, status: "APPROVED" },
    include: {
      profile: {
        select: { firstName: true, lastName: true, email: true },
      },
      images: { select: { url: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  return reviews.map((r) => {
    const name =
      [r.profile.firstName, r.profile.lastName].filter(Boolean).join(" ") ||
      r.profile.email?.split("@")[0] ||
      "Customer";
    return {
      id: r.id,
      author: name,
      rating: r.rating,
      title: r.title,
      content: r.content,
      date: r.createdAt,
      verified: false,
      images: r.images.map((i) => i.url),
    };
  });
}

export function getTestimonials() {
  return DEMO_TESTIMONIALS;
}

// ---------- Coupons ----------

export async function getCoupon(code: string): Promise<CouponSummary | null> {
  const ready = await isDbReady();
  if (!ready) {
    return null;
  }
  void ready;
  const coupon = await prisma.coupon.findUnique({
    where: { code: code.toUpperCase() },
  });
  if (!coupon || !coupon.isActive) return null;
  return {
    code: coupon.code,
    type: coupon.type,
    value: Number(coupon.value),
    minOrder: Number(coupon.minOrder),
    maxDiscount: coupon.maxDiscount ? Number(coupon.maxDiscount) : null,
    expiryDate: coupon.expiryDate?.toISOString() ?? null,
  };
}

// ---------- Static pages ----------

export async function getPage(slug: string) {
  const ready = await isDbReady();
  if (!ready) {
    const content: Record<string, { title: string; content: string }> = {
      "about-us": {
        title: "About TimeCart",
        content:
          "TimeCart is a modern destination for watches — combining timeless design with a simple, trustworthy shopping experience.<br/><br/>We offer authentic watches from trusted brands, delivered to your doorstep with secure payment and easy returns.<br/><br/><strong>Where Time Meets Style.</strong>",
      },
      "shipping-policy": {
        title: "Shipping Policy",
        content:
          "We deliver nationwide across Pakistan. <strong>Standard Delivery</strong> arrives in 3–5 working days. <strong>Express Delivery</strong> arrives in 1–2 working days.<br/><br/>Free shipping on orders above Rs. 10,000. For orders below, a flat rate of Rs. 250 applies.",
      },
      "return-policy": {
        title: "Return & Refund Policy",
        content:
          "We offer a 7-day easy return window on all unworn watches in their original packaging.<br/><br/>To initiate a return, contact our support team within 7 days of delivery. Refunds are processed within 5–7 working days after inspection.",
      },
      "warranty-policy": {
        title: "Warranty Policy",
        content:
          "Every watch purchased from TimeCart includes a manufacturer warranty (1 to 2 years depending on brand).<br/><br/>This covers mechanical defects and movement issues. It does not cover accidental damage, battery replacement on quartz models, or normal wear.",
      },
      "privacy-policy": {
        title: "Privacy Policy",
        content:
          "Your privacy matters to us. We collect only the information needed to process your orders — name, contact details and delivery address.<br/><br/>We never sell your personal data to third parties. Payment details are handled securely and never stored on our servers.",
      },
      "terms-and-conditions": {
        title: "Terms & Conditions",
        content:
          "By using TimeCart you agree to the following terms. All prices listed are in Pakistani Rupees (PKR) and include applicable taxes unless stated otherwise.<br/><br/>We reserve the right to refuse or cancel orders in cases of suspected fraud or pricing errors.",
      },
      faq: {
        title: "Frequently Asked Questions",
        content:
          "<strong>Q: How long does delivery take?</strong><br/>Standard delivery takes 3–5 working days, express takes 1–2 working days.<br/><br/><strong>Q: Are the watches authentic?</strong><br/>Yes. Every watch is sourced from authorised distributors and comes with a genuine manufacturer warranty.<br/><br/><strong>Q: Can I pay on delivery?</strong><br/>Absolutely. Cash on Delivery is available nationwide.<br/><br/><strong>Q: What is your return policy?</strong><br/>7-day easy returns on unworn watches in original condition.",
      },
    };
    const page = content[slug] ?? {
      title: slug,
      content: "Content coming soon.",
    };
    return { slug, title: page.title, content: page.content };
  }
  void ready;
  return prisma.page.findUnique({ where: { slug, isActive: true } });
}

export function getPromoBanner() {
  return {
    title: "Up to 30% OFF Selected Watches",
    subtitle: "A timeless classic, now at a special price.",
    cta: "Shop the Sale",
    href: "/watches?s=discount",
  };
}