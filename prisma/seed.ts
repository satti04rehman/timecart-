/**
 * TimeCart seed script.
 *
 * Usage: node prisma/seed.ts
 * Requires a live DATABASE_URL (Supabase Postgres) — see .env.example.
 */
import "dotenv/config";
import pg from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client.ts";
import type { Gender } from "../src/generated/prisma/enums.ts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString || connectionString.includes("your-supabase")) {
  console.error(
    "❌ DATABASE_URL is not set. Add your Supabase Postgres URL and try again."
  );
  process.exit(1);
}

const poolUrl = new URL(connectionString);
poolUrl.search = "";
const pool = new pg.Pool({
  connectionString: poolUrl.toString(),
  ssl: poolUrl.hostname.includes("pooler.supabase.com")
    ? { rejectUnauthorized: false }
    : undefined,
});
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

const DEMO_CATEGORIES = [
  { name: "Dress Watches", slug: "dress" },
  { name: "Sports Watches", slug: "sport" },
  { name: "Smart Watches", slug: "smart" },
  { name: "Casual Watches", slug: "casual" },
  { name: "Luxury Watches", slug: "luxury" },
  { name: "Chronograph", slug: "chronograph" },
  { name: "Automatic Watches", slug: "automatic" },
  { name: "Unisex Watches", slug: "unisex" },
];

const DEMO_BRANDS = [
  { name: "Casio", slug: "casio", country: "Japan" },
  { name: "Seiko", slug: "seiko", country: "Japan" },
  { name: "Orient", slug: "orient", country: "Japan" },
  { name: "Titan", slug: "titan", country: "India" },
  { name: "Fossil", slug: "fossil", country: "USA" },
  { name: "Citizen", slug: "citizen", country: "Japan" },
  { name: "Timex", slug: "timex", country: "USA" },
  { name: "Hush Puppies", slug: "hush-puppies", country: "USA" },
  { name: "Armani Exchange", slug: "armani-exchange", country: "Italy" },
  { name: "Garmin", slug: "garmin", country: "USA" },
];

const PRODUCTS = [
  { slug: "casio-a168-classic-digital", sku: "TC-CAS-001", name: "Casio A168 Classic Digital Watch", brand: "casio", category: "casual", price: 4500, discount: 10, gender: "UNISEX", movement: "Quartz", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "36 mm", waterResistance: "3 ATM", style: "classic", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-casio-a168/1000/1000", isBestSeller: true, stock: 40 },
  { slug: "casio-g-shock-ga-2100", sku: "TC-CAS-002", name: "Casio G-Shock GA-2100", brand: "casio", category: "sport", price: 14500, discount: 5, gender: "MEN", movement: "Quartz", strapMaterial: "Resin", caseMaterial: "Resin", caseDiameter: "48 mm", waterResistance: "20 ATM", style: "sport", occasion: "Outdoor", featuredImageUrl: "https://picsum.photos/seed/tc-gshock-ga2100/1000/1000", isBestSeller: true, stock: 22 },
  { slug: "casio-f91w-classic", sku: "TC-CAS-003", name: "Casio F-91W Classic", brand: "casio", category: "casual", price: 1900, discount: 0, gender: "UNISEX", movement: "Quartz", strapMaterial: "Resin", caseMaterial: "Resin", caseDiameter: "38 mm", waterResistance: "3 ATM", style: "classic", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-f91w/1000/1000", stock: 60 },
  { slug: "casio-edifice-ecb-900", sku: "TC-CAS-004", name: "Casio Edifice ECB-900", brand: "casio", category: "chronograph", price: 32500, discount: 15, gender: "MEN", movement: "Quartz", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "43 mm", waterResistance: "10 ATM", style: "classic", occasion: "Formal", featuredImageUrl: "https://picsum.photos/seed/tc-edifice/1000/1000", isNewArrival: true, stock: 8 },
  { slug: "casio-classic-illuminator-ca53w", sku: "TC-CAS-005", name: "Casio CA-53W Calculator Watch", brand: "casio", category: "casual", price: 3200, discount: 0, gender: "UNISEX", movement: "Quartz", strapMaterial: "Resin", caseMaterial: "Resin", caseDiameter: "37 mm", waterResistance: "3 ATM", style: "classic", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-ca53w/1000/1000", stock: 35 },
  { slug: "seiko-5-sports-automatic", sku: "TC-SEIKO-001", name: "Seiko 5 Sports Automatic", brand: "seiko", category: "automatic", price: 54000, discount: 10, gender: "MEN", movement: "Automatic", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "40 mm", waterResistance: "5 ATM", style: "sport", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-seiko5/1000/1000", isBestSeller: true, stock: 12 },
  { slug: "seiko-presage-cocktail", sku: "TC-SEIKO-002", name: "Seiko Presage Cocktail Time", brand: "seiko", category: "dress", price: 78000, discount: 0, gender: "MEN", movement: "Automatic", strapMaterial: "Leather", caseMaterial: "Stainless Steel", caseDiameter: "40 mm", waterResistance: "5 ATM", style: "classic", occasion: "Formal", featuredImageUrl: "https://picsum.photos/seed/tc-presage/1000/1000", stock: 7 },
  { slug: "seiko-sports-ladies-quartz", sku: "TC-SEIKO-003", name: "Seiko Sports Ladies Quartz", brand: "seiko", category: "casual", price: 31000, discount: 20, gender: "WOMEN", movement: "Quartz", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "35 mm", waterResistance: "5 ATM", style: "minimal", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-seiko-ladies/1000/1000", isNewArrival: true, stock: 10 },
  { slug: "seiko-snk809-automatic", sku: "TC-SEIKO-004", name: "Seiko SNK809 Automatic", brand: "seiko", category: "automatic", price: 29000, discount: 25, gender: "MEN", movement: "Automatic", strapMaterial: "Nylon", caseMaterial: "Stainless Steel", caseDiameter: "37 mm", waterResistance: "3 ATM", style: "classic", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-snk809/1000/1000", isBestSeller: true, stock: 15 },
  { slug: "orient-bambino-v2", sku: "TC-ORIENT-001", name: "Orient Bambino Version 2", brand: "orient", category: "dress", price: 65000, discount: 10, gender: "MEN", movement: "Automatic", strapMaterial: "Leather", caseMaterial: "Stainless Steel", caseDiameter: "40 mm", waterResistance: "3 ATM", style: "classic", occasion: "Formal", featuredImageUrl: "https://picsum.photos/seed/tc-bambino/1000/1000", isBestSeller: true, stock: 9 },
  { slug: "orient-kamasu-diver", sku: "TC-ORIENT-002", name: "Orient Kamasu Diver", brand: "orient", category: "sport", price: 61000, discount: 15, gender: "MEN", movement: "Automatic", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "41 mm", waterResistance: "20 ATM", style: "sport", occasion: "Outdoor", featuredImageUrl: "https://picsum.photos/seed/tc-kamasu/1000/1000", stock: 5 },
  { slug: "titan-regalia-automatic", sku: "TC-TITAN-001", name: "Titan Regalia Automatic", brand: "titan", category: "dress", price: 42500, discount: 10, gender: "MEN", movement: "Automatic", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "38 mm", waterResistance: "5 ATM", style: "classic", occasion: "Formal", featuredImageUrl: "https://picsum.photos/seed/tc-regalia/1000/1000", stock: 11 },
  { slug: "titan-edge-ladies", sku: "TC-TITAN-002", name: "Titan Edge Ladies", brand: "titan", category: "dress", price: 28500, discount: 0, gender: "WOMEN", movement: "Quartz", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "30 mm", waterResistance: "3 ATM", style: "minimal", occasion: "Formal", featuredImageUrl: "https://picsum.photos/seed/tc-edge/1000/1000", isNewArrival: true, stock: 14 },
  { slug: "fossil-jr1437-chronograph", sku: "TC-FOSSIL-001", name: "Fossil Chronograph JR1437", brand: "fossil", category: "chronograph", price: 38500, discount: 30, gender: "MEN", movement: "Quartz", strapMaterial: "Leather", caseMaterial: "Stainless Steel", caseDiameter: "44 mm", waterResistance: "5 ATM", style: "classic", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-fossil-jr/1000/1000", isBestSeller: true, stock: 18 },
  { slug: "fossil-caroline-mini", sku: "TC-FOSSIL-002", name: "Fossil Caroline Mini", brand: "fossil", category: "casual", price: 27500, discount: 15, gender: "WOMEN", movement: "Quartz", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "32 mm", waterResistance: "5 ATM", style: "minimal", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-caroline/1000/1000", stock: 13 },
  { slug: "citizen-ecco-drive-promaster", sku: "TC-CITIZEN-001", name: "Citizen Eco-Drive Promaster", brand: "citizen", category: "sport", price: 89000, discount: 10, gender: "MEN", movement: "Eco-Drive", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "42 mm", waterResistance: "20 ATM", style: "sport", occasion: "Outdoor", featuredImageUrl: "https://picsum.photos/seed/tc-promaster/1000/1000", stock: 6 },
  { slug: "citizen-ecco-drive-ladies", sku: "TC-CITIZEN-002", name: "Citizen Eco-Drive Ladies", brand: "citizen", category: "dress", price: 52000, discount: 0, gender: "WOMEN", movement: "Eco-Drive", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "33 mm", waterResistance: "5 ATM", style: "classic", occasion: "Formal", featuredImageUrl: "https://picsum.photos/seed/tc-citizen-ladies/1000/1000", stock: 8 },
  { slug: "timex-weekender-38", sku: "TC-TIMEX-001", name: "Timex Weekender 38mm", brand: "timex", category: "casual", price: 12500, discount: 0, gender: "UNISEX", movement: "Quartz", strapMaterial: "Nylon", caseMaterial: "Brass", caseDiameter: "38 mm", waterResistance: "3 ATM", style: "casual", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-weekender/1000/1000", stock: 28 },
  { slug: "timex-expedition-field", sku: "TC-TIMEX-002", name: "Timex Expedition Field", brand: "timex", category: "sport", price: 16500, discount: 20, gender: "MEN", movement: "Quartz", strapMaterial: "Fabric", caseMaterial: "Brass", caseDiameter: "40 mm", waterResistance: "5 ATM", style: "sport", occasion: "Outdoor", featuredImageUrl: "https://picsum.photos/seed/tc-expedition/1000/1000", stock: 20 },
  { slug: "hush-puppies-refined", sku: "TC-HP-001", name: "Hush Puppies Refined", brand: "hush-puppies", category: "casual", price: 16000, discount: 10, gender: "MEN", movement: "Quartz", strapMaterial: "Leather", caseMaterial: "Stainless Steel", caseDiameter: "41 mm", waterResistance: "5 ATM", style: "casual", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-hushpuppies/1000/1000", isNewArrival: true, stock: 24 },
  { slug: "armani-exchange-chronograph", sku: "TC-AX-001", name: "Armani Exchange Chronograph", brand: "armani-exchange", category: "chronograph", price: 54000, discount: 25, gender: "MEN", movement: "Quartz", strapMaterial: "Stainless Steel", caseMaterial: "Stainless Steel", caseDiameter: "44 mm", waterResistance: "5 ATM", style: "classic", occasion: "Formal", featuredImageUrl: "https://picsum.photos/seed/tc-ax-chrono/1000/1000", isBestSeller: true, stock: 10 },
  { slug: "garmin-forerunner-165", sku: "TC-GARMIN-001", name: "Garmin Forerunner 165", brand: "garmin", category: "smart", price: 155000, discount: 5, gender: "MEN", movement: "Smart", strapMaterial: "Silicone", caseMaterial: "Polymer", caseDiameter: "43 mm", waterResistance: "5 ATM", style: "sport", occasion: "Outdoor", featuredImageUrl: "https://picsum.photos/seed/tc-forerunner/1000/1000", isNewArrival: true, stock: 4 },
  { slug: "garmin-vivoactive-5", sku: "TC-GARMIN-002", name: "Garmin Venu Sq 2", brand: "garmin", category: "smart", price: 115000, discount: 0, gender: "UNISEX", movement: "Smart", strapMaterial: "Silicone", caseMaterial: "Polymer", caseDiameter: "40 mm", waterResistance: "5 ATM", style: "sport", occasion: "Everyday", featuredImageUrl: "https://picsum.photos/seed/tc-venusq/1000/1000", stock: 6 },
];

async function main() {
  console.log("🌱 Seeding TimeCart…");

  // Admin user
  const adminEmail = process.env.SEED_ADMIN_EMAIL || "admin@timecart.pk";
  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      id: "seed-admin",
      email: adminEmail,
      provider: "email",
    },
  });
  await prisma.profile.upsert({
    where: { userId: "seed-admin" },
    update: { role: "ADMIN" },
    create: {
      userId: "seed-admin",
      role: "ADMIN",
      firstName: "TimeCart",
      lastName: "Admin",
    },
  });
  console.log(`✔ Admin user (${adminEmail})`);

  // Brands
  const brandMap = new Map<string, string>();
  for (const [i, b] of DEMO_BRANDS.entries()) {
    const row = await prisma.brand.upsert({
      where: { slug: b.slug },
      update: {},
      create: {
        name: b.name,
        slug: b.slug,
        country: b.country,
        sortOrder: i,
        logoUrl: `https://picsum.photos/seed/logo-${b.slug}/200/80`,
      },
    });
    brandMap.set(b.slug, row.id);
  }
  console.log(`✔ ${DEMO_BRANDS.length} brands`);

  // Categories
  const catMap = new Map<string, string>();
  for (const [i, c] of DEMO_CATEGORIES.entries()) {
    const row = await prisma.category.upsert({
      where: { slug: c.slug },
      update: {},
      create: {
        name: c.name,
        slug: c.slug,
        imageUrl: `https://picsum.photos/seed/cat-${c.slug}/800/600`,
        sortOrder: i,
      },
    });
    catMap.set(c.slug, row.id);
  }
  console.log(`✔ ${DEMO_CATEGORIES.length} categories`);

  // Products
  let count = 0;
  for (const p of PRODUCTS) {
    const brandId = brandMap.get(p.brand);
    const categoryId = catMap.get(p.category);
    if (!brandId || !categoryId) continue;

    const sale = p.price * (1 - p.discount / 100);
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {},
      create: {
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        description: `${p.name} — a premium timepiece from ${p.brand}.`,
        price: p.price,
        discount: p.discount,
        ratingAvg: Math.min(5, 3.5 + ((count * 7) % 15) / 10),
        ratingCount: 2 + ((count * 3) % 40),
        gender: p.gender as Gender,
        movement: p.movement,
        strapMaterial: p.strapMaterial,
        caseMaterial: p.caseMaterial,
        caseDiameter: p.caseDiameter,
        waterResistance: p.waterResistance,
        warranty: "1 Year",
        displayType: "Analog",
        occasion: p.occasion,
        style: p.style,
        colors: [p.caseMaterial === "Resin" ? "Black" : "Silver"],
        featuredImageUrl: p.featuredImageUrl,
        isBestSeller: p.isBestSeller ?? false,
        isNewArrival: p.isNewArrival ?? false,
        brandId,
        categoryId,
      },
    });

    await prisma.productVariant.create({
      data: {
        name: "Default",
        sku: p.sku,
        color: null,
        stock: p.stock,
        stockStatus: p.stock > 0 ? "IN_STOCK" : "OUT_OF_STOCK",
        isDefault: true,
        productId: product.id,
      },
    });

    for (let i = 0; i < 4; i++) {
      await prisma.productImage
        .create({
          data: {
            url: `https://picsum.photos/seed/${p.slug}-${i + 1}/1000/1000`,
            alt: `${p.name} image ${i + 1}`,
            sortOrder: i,
            productId: product.id,
          },
        })
        .catch(() => {});
    }

    count++;
  }
  console.log(`✔ ${count} products with variants & images`);

  // Coupons
  await prisma.coupon.upsert({
    where: { code: "WELCOME10" },
    update: {},
    create: {
      code: "WELCOME10",
      type: "PERCENTAGE",
      value: 10,
      minOrder: 5000,
      maxDiscount: 1500,
      isActive: true,
    },
  });
  await prisma.coupon.upsert({
    where: { code: "SALE20" },
    update: {},
    create: {
      code: "SALE20",
      type: "PERCENTAGE",
      value: 20,
      minOrder: 15000,
      maxDiscount: 5000,
      isActive: true,
    },
  });
  console.log("✔ Coupons (WELCOME10, SALE20)");

  // Newsletter subscribers (sample)
  await prisma.newsletterSubscriber
    .create({
      data: { email: "subscriber@example.com" },
    })
    .catch(() => {});

  console.log("🎉 Seed complete!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });