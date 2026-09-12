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

const IMG = (slug: string) =>
  `https://bbvfadophecydxaqefuq.supabase.co/storage/v1/object/public/timecart/${slug}.jpg`;

const PRODUCT_EXTRA: Record<
  string,
  {
    imageUrl: string;
    description: string;
    displayType: string;
    specifications: Record<string, string>;
  }
> = {
  "casio-a168-classic-digital": {
    imageUrl: IMG("casio-a168-classic-digital"),
    displayType: "Digital",
    description:
      "The retro icon, reborn. The Casio A168 pairs a chrome-finished case and stainless steel link bracelet with a classic 8-digit LCD — EL backlight, stopwatch, daily alarm and auto calendar in a slim silhouette that has stayed in style for decades.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "36 mm",
      "Water Resistance": "3 ATM / 30 m",
      Display: "Digital LCD",
      Backlight: "Electro-luminescent",
      Functions: "Stopwatch, Alarm, Auto-calendar",
      Battery: "CR2016 (~7 years)",
      Warranty: "1 Year",
    },
  },
  "casio-g-shock-ga-2100": {
    imageUrl: IMG("casio-g-shock-ga-2100"),
    displayType: "Analog-Digital",
    description:
      "The octagonal icon known as the 'CasiOak'. The GA-2100 packs Casio's legendary shock resistance into a slim, carbon-core case — 200 metre water resistance, world time, stopwatch and a super-illuminator LED.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Carbon & Resin (Carbon Core Guard)",
      "Strap Material": "Resin",
      "Case Diameter": "48.5 mm",
      "Water Resistance": "20 ATM / 200 m",
      Display: "Analog-Digital",
      Backlight: "Super Illuminator LED",
      Functions: "World Time, Stopwatch, Timer, Alarm",
      Protection: "Shock Resistant",
      Battery: "~3 years",
      Warranty: "1 Year",
    },
  },
  "casio-f91w-classic": {
    imageUrl: IMG("casio-f91w-classic"),
    displayType: "Digital",
    description:
      "The most famous digital watch ever made. The Casio F-91W is feather-light, utterly reliable and iconic — 8-digit LCD with electro-luminescent backlight, 1/100 sec stopwatch, daily alarm and auto calendar.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Resin",
      "Strap Material": "Resin",
      "Case Diameter": "38 mm",
      "Water Resistance": "3 ATM / 30 m",
      Display: "Digital LCD",
      Backlight: "Electro-luminescent",
      Functions: "Stopwatch, Alarm, Auto-calendar",
      Battery: "CR2016 (~7 years)",
      Warranty: "1 Year",
    },
  },
  "casio-edifice-ecb-900": {
    imageUrl: IMG("casio-edifice-ecb-900"),
    displayType: "Analog",
    description:
      "Racing heritage, smart connectivity. The Edifice ECB-900 links to your phone over Bluetooth for precision time sync, with a sapphire crystal, stopwatch and 100 metre water resistance.",
    specifications: {
      Movement: "Quartz (Bluetooth Link)",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "43 mm",
      "Water Resistance": "10 ATM / 100 m",
      Display: "Analog Chronograph",
      Crystal: "Sapphire",
      Functions: "Bluetooth Sync, Stopwatch, Timer, World Time",
      Warranty: "1 Year",
    },
  },
  "casio-classic-illuminator-ca53w": {
    imageUrl: IMG("casio-classic-illuminator-ca53w"),
    displayType: "Digital",
    description:
      "An '80s time-travel piece worn by pop-culture icons. The CA-53W packs a working 8-digit calculator beside a sharp LCD clock — alarm, stopwatch, auto calendar and unmistakable retro charm.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Resin",
      "Strap Material": "Resin",
      "Case Diameter": "37 mm",
      "Water Resistance": "3 ATM / 30 m",
      Display: "Digital LCD with Calculator",
      Functions: "Calculator, Alarm, Auto-calendar",
      Battery: "CR2016",
      Warranty: "1 Year",
    },
  },
  "seiko-5-sports-automatic": {
    imageUrl: IMG("seiko-5-sports-automatic"),
    displayType: "Analog",
    description:
      "A modern classic from the longest-running mechanical watch family in history. The Seiko 5 Sports runs on the in-house Calibre 4R36 automatic with a day-date window beneath a Hardlex crystal.",
    specifications: {
      Movement: "Automatic Calibre 4R36",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "40 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Analog (Day & Date)",
      "Power Reserve": "~41 hours",
      Jewels: "24",
      Crystal: "Hardlex",
      Warranty: "1 Year",
    },
  },
  "seiko-presage-cocktail": {
    imageUrl: IMG("seiko-presage-cocktail"),
    displayType: "Analog",
    description:
      "Inspired by mixology, finished like fine jewellery. The Presage Cocktail Time's sunray dial captures the shimmer of a perfectly poured drink — powered by the automatic Calibre 4R35 and framed by a box-shaped sapphire crystal.",
    specifications: {
      Movement: "Automatic Calibre 4R35",
      "Case Material": "Stainless Steel",
      "Strap Material": "Leather",
      "Case Diameter": "40 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Analog (Date)",
      "Power Reserve": "~41 hours",
      Crystal: "Box-shaped Sapphire",
      Warranty: "1 Year",
    },
  },
  "seiko-sports-ladies-quartz": {
    imageUrl: IMG("seiko-sports-ladies-quartz"),
    displayType: "Analog",
    description:
      "Quietly refined. This ladies' Seiko pairs a slim stainless steel case with an accurate Japanese quartz movement and a clean, legible dial — an effortless companion from office to evening.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "35 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Analog (Date)",
      Crystal: "Hardlex",
      Warranty: "1 Year",
    },
  },
  "seiko-snk809-automatic": {
    imageUrl: IMG("seiko-snk809-automatic"),
    displayType: "Analog",
    description:
      "The watch that started a thousand collection journeys. The SNK809 is an in-house automatic at an unbeatable price — military-field dial, day-date at 3 o'clock, exhibition caseback and a 21,600 vph movement.",
    specifications: {
      Movement: "Automatic Calibre 7S26",
      "Case Material": "Stainless Steel",
      "Strap Material": "Nylon",
      "Case Diameter": "37 mm",
      "Water Resistance": "3 ATM / 30 m",
      Display: "Analog (Day & Date)",
      "Power Reserve": "~40 hours",
      Jewels: "21",
      Crystal: "Hardlex",
      Warranty: "1 Year",
    },
  },
  "orient-bambino-v2": {
    imageUrl: IMG("orient-bambino-v2"),
    displayType: "Analog",
    description:
      "The people's Calatrava. The Bambino Version 2 is a mid-century dress classic built on Orient's in-house Calibre F6724 automatic — domed crystal, stepped crown, elegant numerals.",
    specifications: {
      Movement: "Automatic Calibre F6724",
      "Case Material": "Stainless Steel",
      "Strap Material": "Leather",
      "Case Diameter": "40 mm",
      "Water Resistance": "3 ATM / 30 m",
      Display: "Analog (Date)",
      "Power Reserve": "~40 hours",
      Crystal: "Domed Mineral",
      Warranty: "1 Year",
    },
  },
  "orient-kamasu-diver": {
    imageUrl: IMG("orient-kamasu-diver"),
    displayType: "Analog",
    description:
      "A genuine dive watch with luxury specs on a budget. The Kamasu pairs Orient's Calibre F6922 automatic with sapphire crystal, a screw-down crown and 200 metres of water resistance.",
    specifications: {
      Movement: "Automatic Calibre F6922",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "41 mm",
      "Water Resistance": "20 ATM / 200 m",
      Display: "Analog (Date)",
      "Power Reserve": "~40 hours",
      Crystal: "Sapphire",
      Crown: "Screw-Down",
      Bezel: "Uni-directional Diver's",
      Warranty: "1 Year",
    },
  },
  "titan-regalia-automatic": {
    imageUrl: IMG("titan-regalia-automatic"),
    displayType: "Analog",
    description:
      "Indian luxury, distilled. The Titan Regalia is an automatic dress watch with a layered, sun-brushed dial and a slim stainless steel case — a stately presence for formal occasions.",
    specifications: {
      Movement: "Automatic",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "38 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Analog (Date)",
      Crystal: "Sapphire-Coated",
      Warranty: "1 Year",
    },
  },
  "titan-edge-ladies": {
    imageUrl: IMG("titan-edge-ladies"),
    displayType: "Analog",
    description:
      "The world-famous Edge, in a ladies' silhouette. Featherlight and strikingly slim, this Titan combines an ultra-thin case with dependable quartz accuracy.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Stainless Steel (ultra-slim)",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "30 mm",
      "Water Resistance": "3 ATM / 30 m",
      Thickness: "~6 mm",
      Display: "Analog",
      Warranty: "1 Year",
    },
  },
  "fossil-jr1437-chronograph": {
    imageUrl: IMG("fossil-jr1437-chronograph"),
    displayType: "Chronograph",
    description:
      "Vintage Americana with a mechanical heart. The JR1437 is a 44 mm chronograph with three subdials, tachymeter bezel and date window in a polished steel case with a rich brown leather strap.",
    specifications: {
      Movement: "Quartz Chronograph",
      "Case Material": "Stainless Steel",
      "Strap Material": "Leather",
      "Case Diameter": "44 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Chronograph (3 Subdials, Date)",
      Crystal: "Mineral",
      Warranty: "1 Year",
    },
  },
  "fossil-caroline-mini": {
    imageUrl: IMG("fossil-caroline-mini"),
    displayType: "Analog",
    description:
      "Delicate, demure, delightful. The Caroline Mini is a petite ladies' watch with a clean minimalist dial and a slim steel bracelet.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "32 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Analog",
      Crystal: "Mineral",
      Warranty: "1 Year",
    },
  },
  "citizen-ecco-drive-promaster": {
    imageUrl: IMG("citizen-ecco-drive-promaster"),
    displayType: "Analog",
    description:
      "A professional diver powered by light. Citizen's Eco-Drive converts any light source into energy — no battery, ever. The Promaster adds a uni-directional bezel and 200 metres of water resistance.",
    specifications: {
      Movement: "Eco-Drive (Light-Powered)",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "42 mm",
      "Water Resistance": "20 ATM / 200 m",
      Display: "Analog (Date)",
      "Power Reserve": "~6 months",
      Crown: "Screw-Down",
      Bezel: "Uni-directional Diver's",
      Warranty: "1 Year",
    },
  },
  "citizen-ecco-drive-ladies": {
    imageUrl: IMG("citizen-ecco-drive-ladies"),
    displayType: "Analog",
    description:
      "Never needs a battery — just light. This Citizen Eco-Drive ladies' watch pairs an accurate light-powered movement with a slim brushed-steel case and a refined dial.",
    specifications: {
      Movement: "Eco-Drive (Light-Powered)",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "33 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Analog (Date)",
      "Power Reserve": "~6 months",
      Warranty: "1 Year",
    },
  },
  "timex-weekender-38": {
    imageUrl: IMG("timex-weekender-38"),
    displayType: "Analog",
    description:
      "The classic that started a trend. The Weekender's easy-going dial, canvas strap and famous Indiglo night-light make it endlessly versatile.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Brass",
      "Strap Material": "Nylon",
      "Case Diameter": "38 mm",
      "Water Resistance": "3 ATM / 30 m",
      Display: "Analog",
      Backlight: "Indiglo",
      Warranty: "1 Year",
    },
  },
  "timex-expedition-field": {
    imageUrl: IMG("timex-expedition-field"),
    displayType: "Analog",
    description:
      "Rugged, legible and field-ready. The Expedition packs military-style numerals, a 24-hour track and Indiglo illumination into a tough brass case.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Brass",
      "Strap Material": "Fabric",
      "Case Diameter": "40 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Analog",
      Backlight: "Indiglo",
      Warranty: "1 Year",
    },
  },
  "hush-puppies-refined": {
    imageUrl: IMG("hush-puppies-refined"),
    displayType: "Analog",
    description:
      "Comfort-first casual. The Hush Puppies Refined keeps it honest with a clean steel case, a legible dial and a soft leather strap.",
    specifications: {
      Movement: "Quartz",
      "Case Material": "Stainless Steel",
      "Strap Material": "Leather",
      "Case Diameter": "41 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Analog (Date)",
      Crystal: "Mineral",
      Warranty: "1 Year",
    },
  },
  "armani-exchange-chronograph": {
    imageUrl: IMG("armani-exchange-chronograph"),
    displayType: "Chronograph",
    description:
      "Bold, urban, unmistakably AX. This Armani Exchange chronograph pairs a large stainless steel case with a black-on-steel dial, three subdials and a date window.",
    specifications: {
      Movement: "Quartz Chronograph",
      "Case Material": "Stainless Steel",
      "Strap Material": "Stainless Steel",
      "Case Diameter": "44 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "Chronograph (Subdials, Date)",
      Crystal: "Mineral",
      Warranty: "1 Year",
    },
  },
  "garmin-forerunner-165": {
    imageUrl: IMG("garmin-forerunner-165"),
    displayType: "AMOLED Touch",
    description:
      "Train smarter, recover faster. The Forerunner 165 brings Garmin's proven running platform to a bright AMOLED touchscreen — wrist heart rate, GPS, recovery insights and Body Battery.",
    specifications: {
      Movement: "GPS Smart (Forerunner 165)",
      "Case Material": "Fiber-reinforced Polymer",
      "Strap Material": "Silicone",
      "Case Diameter": "43 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "1.2\" AMOLED Touch",
      Battery: "Up to 19 hrs GPS / 11 days watch",
      Sensors: "GPS, Heart Rate, SpO2, Compass",
      Features: "Body Battery, Recovery, Training Status",
      Warranty: "1 Year",
    },
  },
  "garmin-vivoactive-5": {
    imageUrl: IMG("garmin-vivoactive-5"),
    displayType: "AMOLED Touch",
    description:
      "Wellness on your wrist. The Venu Sq 2 brings a vivid AMOLED display, built-in GPS, health sensing and long battery life to a lightweight smartwatch.",
    specifications: {
      Movement: "GPS Smart (Venu Sq 2)",
      "Case Material": "Aluminium-reinforced Polymer",
      "Strap Material": "Silicone",
      "Case Diameter": "40 mm",
      "Water Resistance": "5 ATM / 50 m",
      Display: "1.4\" AMOLED Touch",
      Battery: "Up to 11 days",
      Sensors: "GPS, Heart Rate, SpO2, Stress",
      Features: "Body Battery, Sleep Score, Workouts",
      Warranty: "1 Year",
    },
  },
};

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

    const extra = PRODUCT_EXTRA[p.slug];
    const product = await prisma.product.upsert({
      where: { slug: p.slug },
      update: {
        ...(extra
          ? {
              description: extra.description,
              displayType: extra.displayType,
              specifications: extra.specifications as never,
              featuredImageUrl: extra.imageUrl,
            }
          : {}),
      },
      create: {
        slug: p.slug,
        name: p.name,
        sku: p.sku,
        description: extra?.description ?? `${p.name} — a premium timepiece from ${p.brand}.`,
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
        displayType: extra?.displayType ?? "Analog",
        occasion: p.occasion,
        style: p.style,
        colors: [p.caseMaterial === "Resin" ? "Black" : "Silver"],
        specifications: (extra?.specifications as never) ?? undefined,
        featuredImageUrl: extra?.imageUrl ?? p.featuredImageUrl,
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

    await prisma.productImage
      .create({
        data: {
          url: extra?.imageUrl ?? p.featuredImageUrl,
          alt: p.name,
          sortOrder: 0,
          productId: product.id,
        },
      })
      .catch(() => {});

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