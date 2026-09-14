export type Gender = "MEN" | "WOMEN" | "UNISEX";

export interface CategorySummary {
  id: string;
  name: string;
  slug: string;
  imageUrl: string | null;
  parentId: string | null;
}

export interface BrandSummary {
  id: string;
  name: string;
  slug: string;
  logoUrl: string | null;
}

export interface ProductSummary {
  id: string;
  slug: string;
  name: string;
  sku: string;
  price: number;
  discount: number;
  salePrice: number;
  brand: { id: string; name: string; slug: string };
  category: { id: string; name: string; slug: string };
  gender: Gender;
  imageUrl: string | null;
  ratingAvg: number;
  ratingCount: number;
  stockStatus: string;
  stock: number;
  isNewArrival: boolean;
  isBestSeller: boolean;
  colors?: string[];
  movement?: string | null;
}

export interface ProductDetail extends ProductSummary {
  description: string | null;
  strapMaterial: string | null;
  caseMaterial: string | null;
  caseDiameter: string | null;
  waterResistance: string | null;
  warranty: string | null;
  displayType: string | null;
  occasion: string | null;
  style: string | null;
  specifications: Record<string, string> | null;
  videoUrl?: string | null;
  images: { id: string; url: string; alt: string | null; sortOrder: number }[];
  variants: {
    id: string;
    name: string;
    sku: string;
    color: string | null;
    size: string | null;
    price: number | null;
    stock: number;
    stockStatus: string;
    isDefault: boolean;
  }[];
}

export interface ProductFilters {
  category?: string;
  brand?: string;
  gender?: string;
  q?: string;
  minPrice?: number;
  maxPrice?: number;
  color?: string;
  strap?: string;
  caseMaterial?: string;
  movement?: string;
  style?: string;
  waterResistance?: string;
  minRating?: number;
  inStock?: boolean;
  onSale?: boolean;
  sort?: string;
  page?: number;
}

export interface CartItem {
  key: string;
  productId: string;
  productSlug: string;
  name: string;
  brand: string;
  imageUrl: string | null;
  variantId?: string | null;
  variantName?: string | null;
  color?: string | null;
  unitPrice: number;
  quantity: number;
  maxStock: number;
}

export interface OrderSummary {
  id: string;
  orderNumber: string;
  status: string;
  total: number;
  itemsCount: number;
  createdAt: string;
}

export interface CouponSummary {
  code: string;
  type: "PERCENTAGE" | "FIXED";
  value: number;
  minOrder: number;
  maxDiscount: number | null;
  expiryDate: string | null;
}