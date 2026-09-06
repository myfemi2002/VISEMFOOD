import {
  bulkOrders as mockBulkOrders,
  cateringRequests as mockCateringRequests,
  categoryFilters as mockCategoryFilters,
  products as mockProducts,
  siteMeta as mockSiteMeta,
  trayPackages as mockTrayPackages,
  type Product as MockProduct,
  type TrayPackage as MockTrayPackage,
} from "@/data/mock";
import { apiRequest } from "@/lib/api";
import { formatCurrency } from "@/lib/currency";
import { DEFAULT_CURRENCY_CODE } from "@/lib/runtime-config";

type PaginationMeta = {
  current_page: number;
  last_page: number;
  per_page: number;
  total: number;
  from: number | null;
  to: number | null;
};

type ApiCategory = {
  id: number;
  name: string;
  slug: string;
  description: string | null;
  status?: string | null;
  sort_order: number;
  image_url: string | null;
  image_media_id?: number | null;
  image?: ApiMediaAsset | null;
  products_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiMediaAsset = {
  id: number;
  url: string;
  path?: string | null;
  disk?: string | null;
  storage_driver?: string | null;
  directory?: string | null;
  filename?: string | null;
  original_filename?: string | null;
  purpose?: string | null;
  alt_text: string | null;
  width: number | null;
  height: number | null;
  mime_type?: string | null;
  extension?: string | null;
  size_bytes?: number | null;
  variants?: Record<string, {
    path?: string | null;
    url?: string | null;
    width?: number | null;
    height?: number | null;
    size_bytes?: number | null;
  }> | null;
  is_primary?: boolean;
  sort_order?: number;
  metadata?: Record<string, unknown> | null;
  uploaded_by?: {
    id: number;
    name: string;
  } | null;
  usage_count?: number;
  usage?: {
    total?: number;
    categories?: number;
    products?: number;
    primary_products?: number;
    gallery_products?: number;
    content_sections?: number;
  } | null;
  used_by?: {
    categories?: Array<{ id: number; name: string; slug: string }>;
    products?: Array<{ id: number; name: string; slug: string }>;
    content_sections?: Array<{ id: number; section_key: string; title: string | null }>;
  } | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiProductVariant = {
  id: number;
  product_id?: number;
  name: string;
  slug: string | null;
  sku?: string | null;
  portion_label: string | null;
  description: string | null;
  price: number;
  base_price?: number;
  sale_price?: number | null;
  compare_price: number | null;
  effective_price?: number;
  currency_code: string;
  availability_status: string;
  is_default: boolean;
  sort_order: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiProduct = {
  id: number;
  category_id?: number;
  name: string;
  slug: string;
  product_type: string;
  short_description: string | null;
  description: string | null;
  base_price: number;
  sale_price?: number | null;
  compare_price: number | null;
  effective_price?: number;
  currency_code: string;
  serving_size: string | null;
  status?: string;
  availability_status: string;
  featured: boolean;
  available_for_order: boolean;
  is_orderable?: boolean;
  preparation_time_minutes: number | null;
  sort_order?: number;
  ordering_notes: string | null;
  category?: ApiCategory;
  variants?: ApiProductVariant[];
  default_variant?: ApiProductVariant | null;
  media?: ApiMediaAsset[];
  primary_image?: ApiMediaAsset | null;
  primary_image_url?: string | null;
  primary_media_id?: number | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiCateringPackage = {
  id: number;
  name: string;
  slug: string;
  short_description: string | null;
  description: string | null;
  starting_price: number;
  currency_code: string;
  minimum_guests: number;
  maximum_guests: number | null;
  inclusions: string[];
  featured: boolean;
  sort_order: number;
  image_url: string | null;
  image_media_id?: number | null;
  image?: ApiMediaAsset | null;
  status?: string | null;
  inquiries_count?: number;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiSiteSettings = {
  id?: number;
  business_name: string | null;
  tagline?: string | null;
  support_email: string | null;
  support_phone: string | null;
  secondary_phone?: string | null;
  whatsapp_order_number: string | null;
  whatsapp_contact_number: string | null;
  whatsapp_ordering_enabled?: boolean | null;
  whatsapp_order_intro?: string | null;
  business_address: string | null;
  city?: string | null;
  state_region?: string | null;
  country?: string | null;
  business_hours: string | null;
  opening_hours?: Record<string, { is_open?: boolean; opens_at?: string | null; closes_at?: string | null }> | null;
  currency_code: string | null;
  currency_symbol: string | null;
  currency_locale?: string | null;
  delivery_information: string | null;
  checkout_notice: string | null;
  social_links: Record<string, string> | null;
  seo_default_title?: string | null;
  seo_default_description?: string | null;
  default_share_image_url?: string | null;
  created_at?: string | null;
  updated_at?: string | null;
};

type ApiUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  status: string;
  role?: {
    id: number;
    name: string;
    slug: string;
  };
  permissions?: string[];
  last_login_at: string | null;
  two_factor_enabled: boolean;
  force_password_reset: boolean;
};

type ApiOrderItem = {
  id: number;
  product_id: number | null;
  product_variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  notes: string | null;
};

type ApiOrder = {
  id: number;
  order_number: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string;
  delivery_type: string;
  delivery_address: string | null;
  preferred_fulfillment_at: string | null;
  customer_notes: string | null;
  admin_notes: string | null;
  currency_code: string;
  subtotal: number;
  delivery_fee: number;
  discount_amount: number;
  estimated_total: number;
  final_total: number | null;
  status: string;
  whatsapp_started_at: string | null;
  ordered_at: string | null;
  confirmed_at: string | null;
  completed_at: string | null;
  items?: ApiOrderItem[];
  created_at: string | null;
  updated_at: string | null;
};

type ApiCateringInquiry = {
  id: number;
  reference_number: string;
  customer_name: string;
  email?: string | null;
  phone?: string | null;
  event_type: string;
  event_date: string | null;
  number_of_guests: number | null;
  preferred_service?: string | null;
  location?: string | null;
  budget?: string | null;
  budget_amount?: number | null;
  requirements?: string | null;
  notes?: string | null;
  status?: string | null;
  internal_notes?: string | null;
  assigned_to?: ApiUser | null;
  catering_package?: {
    id: number;
    name: string;
    slug: string;
    status?: string | null;
    starting_price?: number | null;
    currency_code?: string | null;
  } | null;
  created_at: string | null;
  updated_at?: string | null;
};

type ApiContactMessage = {
  id: number;
  reference_number: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  event_date: string | null;
  guest_count: number | null;
  message: string;
  status: string;
  read_at: string | null;
  internal_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
};

type ApiDashboard = {
  stats: {
    products_total: number;
    products_available: number;
    orders_total: number;
    orders_pending_whatsapp: number;
    orders_confirmed: number;
    orders_completed: number;
    catering_new: number;
    contact_unread: number;
  };
  recent_orders: ApiOrder[];
  recent_catering: ApiCateringInquiry[];
  recent_contact_messages: ApiContactMessage[];
};

export type Category = {
  id: string;
  name: string;
  slug: string;
  description: string;
  imageUrl: string;
  imageMediaId: number | null;
  image: MediaAsset | null;
  productsCount: number;
  status: "active" | "inactive";
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type MediaAsset = {
  id: number;
  url: string;
  path: string;
  disk: string | null;
  storageDriver: string | null;
  directory: string | null;
  filename: string;
  originalFilename: string;
  purpose: string | null;
  altText: string | null;
  width: number | null;
  height: number | null;
  mimeType: string | null;
  extension: string | null;
  sizeBytes: number;
  variants: Record<string, {
    path: string;
    url: string;
    width: number | null;
    height: number | null;
    sizeBytes: number | null;
  }>;
  isPrimary: boolean;
  sortOrder: number;
  metadata: Record<string, unknown>;
  uploadedBy: { id: number; name: string } | null;
  usageCount: number;
  usage: {
    total: number;
    categories: number;
    products: number;
    primaryProducts: number;
    galleryProducts: number;
    contentSections: number;
  };
  usedBy: {
    categories: Array<{ id: number; name: string; slug: string }>;
    products: Array<{ id: number; name: string; slug: string }>;
    contentSections: Array<{ id: number; sectionKey: string; title: string | null }>;
  } | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type MediaSpec = {
  label: string;
  width: number;
  height: number;
  ratio: string;
  maxSizeKb: number;
  minWidth: number;
  minHeight: number;
  formats: string[];
  variants: Record<string, { width: number; height: number }>;
};

export type CategoryInput = {
  name: string;
  slug?: string;
  description?: string;
  status: "active" | "inactive";
  sortOrder?: number;
  imageMediaId?: number | null;
};

export type ProductAvailability = "Available" | "Limited" | "Sold Out";

export type ProductVariant = {
  id: number;
  productId: number | null;
  name: string;
  slug: string | null;
  sku: string | null;
  portionLabel: string | null;
  description: string | null;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  price: number;
  comparePrice: number | null;
  currencyCode: string;
  availabilityStatus: string;
  isDefault: boolean;
  sortOrder: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type Product = {
  id: number;
  categoryId: number | null;
  slug: string;
  name: string;
  category: string;
  categorySlug: string;
  shortDescription: string;
  description: string;
  basePrice: number;
  salePrice: number | null;
  effectivePrice: number;
  price: number;
  comparePrice: number | null;
  currencyCode: string;
  servingSize: string;
  availability: ProductAvailability;
  isOrderable: boolean;
  image: string;
  primaryImage: MediaAsset | null;
  media: MediaAsset[];
  featured: boolean;
  tags: string[];
  productType: string;
  variants: ProductVariant[];
  defaultVariant: ProductVariant | null;
  availableForOrder: boolean;
  preparationTimeMinutes: number | null;
  sortOrder: number;
  orderingNotes: string | null;
  status: string;
  availabilityStatus: string;
  createdAt: string | null;
  updatedAt: string | null;
};

export type ProductVariantInput = {
  id?: number;
  name: string;
  sku?: string;
  portionLabel?: string;
  description?: string;
  price: number;
  salePrice?: number | null;
  availabilityStatus?: string;
  isDefault?: boolean;
  sortOrder?: number;
};

export type ProductInput = {
  categoryId: number;
  productType: string;
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  basePrice: number;
  salePrice?: number | null;
  servingSize?: string;
  status: string;
  availabilityStatus: string;
  featured: boolean;
  availableForOrder: boolean;
  preparationTimeMinutes?: number | null;
  sortOrder?: number;
  orderingNotes?: string;
  primaryMediaId?: number | null;
  mediaIds?: number[];
  variants: ProductVariantInput[];
};

export type CateringPackage = {
  id: number;
  name: string;
  slug: string;
  shortDescription: string;
  description: string;
  startingPrice: number;
  currencyCode: string;
  minimumGuests: number;
  maximumGuests: number | null;
  inclusions: string[];
  featured: boolean;
  status: "active" | "inactive";
  sortOrder: number;
  imageUrl: string;
  imageMediaId: number | null;
  image: MediaAsset | null;
  inquiriesCount: number;
  createdAt: string | null;
  updatedAt: string | null;
};

export type CateringPackageInput = {
  name: string;
  slug?: string;
  shortDescription?: string;
  description?: string;
  startingPrice: number;
  minimumGuests: number;
  maximumGuests?: number | null;
  inclusions?: string[];
  imageMediaId?: number | null;
  featured: boolean;
  status: "active" | "inactive";
  sortOrder?: number;
};

export type PublicCateringInquiryReceipt = {
  id: number;
  referenceNumber: string;
  customerName: string;
  eventType: string;
  eventDate: string | null;
  guestCount: number | null;
  preferredService: string | null;
  location: string | null;
  packageId: number | null;
  packageName: string | null;
  packageSlug: string | null;
  createdAt: string | null;
};

export type TrayPackage = {
  id: string;
  slug: string;
  name: string;
  type: string;
  price: number;
  servingRange: string;
  shortDescription: string;
  notes: string[];
  image: string;
  availability: Product["availability"];
  productType: string;
};

export type OpeningHoursDayKey =
  | "monday"
  | "tuesday"
  | "wednesday"
  | "thursday"
  | "friday"
  | "saturday"
  | "sunday";

export type OpeningHoursEntry = {
  isOpen: boolean;
  opensAt: string;
  closesAt: string;
};

export type OpeningHours = Record<OpeningHoursDayKey, OpeningHoursEntry>;

export type SiteSocialLinks = {
  instagram: string;
  facebook: string;
  tiktok: string;
  youtube: string;
  whatsapp: string;
};

export type SiteMeta = {
  name: string;
  tagline: string;
  phone: string;
  secondaryPhone: string;
  email: string;
  whatsappOrderNumber: string;
  whatsappContactNumber: string;
  whatsappOrderingEnabled: boolean;
  whatsappOrderIntro: string;
  address: string;
  city: string;
  stateRegion: string;
  country: string;
  hours: string;
  openingHours: OpeningHours;
  currencyCode: string;
  currencySymbol: string;
  currencyLocale: string;
  deliveryInformation: string;
  checkoutNotice: string;
  socialLinks: SiteSocialLinks;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  defaultShareImageUrl: string;
  createdAt?: string | null;
  updatedAt?: string | null;
};

export type SiteSettingsUpdateInput = {
  name: string;
  tagline: string;
  email: string;
  phone: string;
  secondaryPhone: string;
  whatsappNumber: string;
  whatsappContactNumber: string;
  whatsappOrderingEnabled: boolean;
  whatsappOrderIntro: string;
  address: string;
  city: string;
  stateRegion: string;
  country: string;
  openingHours: OpeningHours;
  deliveryInformation: string;
  checkoutNotice: string;
  socialLinks: Omit<SiteSocialLinks, "whatsapp">;
  seoDefaultTitle: string;
  seoDefaultDescription: string;
  defaultShareImageUrl: string;
};

export type AdminUser = {
  id: number;
  name: string;
  email: string;
  phone: string | null;
  role: string;
  roleSlug: string;
  status: string;
  permissions: string[];
  lastLoginAt: string | null;
  twoFactorEnabled: boolean;
  forcePasswordReset: boolean;
};

export type AdminOrderItem = {
  id: number;
  productName: string;
  variantName: string | null;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};

export type AdminOrder = {
  id: number;
  orderNumber: string;
  customer: string;
  email: string | null;
  phone: string;
  deliveryType: string;
  deliveryAddress: string | null;
  preferredFulfillmentAt: string | null;
  customerNotes: string | null;
  adminNotes: string | null;
  estimatedTotal: number;
  finalTotal: number | null;
  total: number;
  subtotal: number;
  status: string;
  statusLabel: string;
  itemCount: number;
  leadItemLabel: string;
  items: AdminOrderItem[];
  createdAt: string | null;
  orderedAt: string | null;
  whatsappStartedAt: string | null;
};

export type AdminCateringInquiry = {
  id: number;
  referenceNumber: string;
  client: string;
  eventType: string;
  eventDate: string;
  guests: number;
  status: string;
  budget: string;
  budgetAmount: number | null;
  email: string;
  phone: string;
  preferredService: string | null;
  location: string | null;
  requirements: string | null;
  notes: string | null;
  internalNotes: string | null;
  statusValue: string;
  packageId: number | null;
  packageName: string | null;
  packageSlug: string | null;
  packageStatus: string | null;
  packageStartingPrice: number | null;
  packageCurrencyCode: string;
  assignedToUserId: number | null;
  assignedToName: string | null;
  createdAt: string | null;
  updatedAt: string | null;
};

export type AdminContactMessage = {
  id: number;
  referenceNumber: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  status: string;
  statusLabel: string;
  createdAt: string | null;
};

export type AdminDashboard = {
  stats: {
    productsTotal: number;
    productsAvailable: number;
    ordersTotal: number;
    ordersPendingWhatsApp: number;
    ordersConfirmed: number;
    ordersCompleted: number;
    cateringNew: number;
    contactUnread: number;
  };
  recentOrders: AdminOrder[];
  recentCatering: AdminCateringInquiry[];
  recentContactMessages: AdminContactMessage[];
};

function slugify(value: string) {
  return value
    .toLowerCase()
    .trim()
    .replace(/&/g, "and")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function titleCase(value: string) {
  return value
    .replace(/[_-]+/g, " ")
    .split(" ")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function digitsOnly(value: string | null | undefined) {
  return (value ?? "").replace(/\D+/g, "");
}

function createEmptyOpeningHours(): OpeningHours {
  return {
    monday: { isOpen: false, opensAt: "", closesAt: "" },
    tuesday: { isOpen: false, opensAt: "", closesAt: "" },
    wednesday: { isOpen: false, opensAt: "", closesAt: "" },
    thursday: { isOpen: false, opensAt: "", closesAt: "" },
    friday: { isOpen: false, opensAt: "", closesAt: "" },
    saturday: { isOpen: false, opensAt: "", closesAt: "" },
    sunday: { isOpen: false, opensAt: "", closesAt: "" },
  };
}

function toOpeningHours(
  openingHours: ApiSiteSettings["opening_hours"],
  fallbackSummary: string | null | undefined,
): OpeningHours {
  const emptyHours = createEmptyOpeningHours();

  if (!openingHours || typeof openingHours !== "object") {
    return emptyHours;
  }

  const entries = Object.entries(emptyHours).map(([dayKey, fallback]) => {
    const day = openingHours[dayKey] ?? {};

    return [
      dayKey,
      {
        isOpen: Boolean(day.is_open),
        opensAt: typeof day.opens_at === "string" ? day.opens_at : fallbackSummary ? "09:00" : fallback.opensAt,
        closesAt: typeof day.closes_at === "string" ? day.closes_at : fallbackSummary ? "17:00" : fallback.closesAt,
      },
    ] as const;
  });

  return Object.fromEntries(entries) as OpeningHours;
}

function uniqueValues(values: Array<string | undefined | null>) {
  return Array.from(new Set(values.map((value) => value?.trim()).filter(Boolean) as string[]));
}

function formatAvailabilityLabel(status: string, availableForOrder: boolean) {
  if (!availableForOrder || status === "unavailable") {
    return "Sold Out" as const;
  }

  if (status === "limited") {
    return "Limited" as const;
  }

  return "Available" as const;
}

function formatAvailabilityStatus(label: MockProduct["availability"]) {
  if (label === "Limited") {
    return "limited";
  }

  if (label === "Sold Out") {
    return "unavailable";
  }

  return "available";
}

function inferMockProductType(product: MockProduct) {
  if (/soup-bowl|bowl/i.test(product.slug)) {
    return "bowl";
  }

  if (/small-chops|hosting/i.test(product.slug)) {
    return "hosting_pack";
  }

  return "menu_item";
}

function buildDefaultVariant(input: {
  id: string | number;
  productId?: number | null;
  name: string;
  servingSize: string;
  price: number;
  salePrice?: number | null;
  currencyCode?: string;
  availabilityStatus?: string;
}): ProductVariant {
  const numericId = typeof input.id === "number" ? input.id : Number(input.id.toString().replace(/\D+/g, "")) || 0;
  const salePrice = input.salePrice ?? null;
  const effectivePrice = salePrice ?? input.price;

  return {
    id: numericId,
    productId: input.productId ?? null,
    name: input.servingSize || input.name,
    slug: slugify(input.servingSize || input.name),
    sku: null,
    portionLabel: input.servingSize,
    description: null,
    basePrice: input.price,
    salePrice,
    effectivePrice,
    price: effectivePrice,
    comparePrice: salePrice,
    currencyCode: input.currencyCode ?? DEFAULT_CURRENCY_CODE,
    availabilityStatus: input.availabilityStatus ?? "available",
    isDefault: true,
    sortOrder: 0,
    createdAt: null,
    updatedAt: null,
  };
}

function toTrayPackageFromMock(pkg: MockTrayPackage): TrayPackage {
  return {
    ...pkg,
    availability: "Available",
    productType: pkg.type.toLowerCase(),
  };
}

function toProductFromMock(product: MockProduct): Product {
  const defaultVariant = buildDefaultVariant({
    id: product.id,
    productId: Number(product.id.replace(/\D+/g, "")) || 0,
    name: product.name,
    servingSize: product.servingSize,
    price: product.price,
    availabilityStatus: formatAvailabilityStatus(product.availability),
  });

  return {
    id: Number(product.id.replace(/\D+/g, "")) || 0,
    categoryId: null,
    slug: product.slug,
    name: product.name,
    category: product.category,
    categorySlug: slugify(product.category),
    shortDescription: product.shortDescription,
    description: product.description,
    basePrice: product.price,
    salePrice: null,
    effectivePrice: defaultVariant.effectivePrice,
    price: defaultVariant.effectivePrice,
    comparePrice: null,
    currencyCode: DEFAULT_CURRENCY_CODE,
    servingSize: product.servingSize,
    availability: product.availability,
    isOrderable: product.availability !== "Sold Out",
    image: product.image,
    primaryImage: null,
    media: [],
    featured: Boolean(product.featured),
    tags: product.tags ?? [],
    productType: inferMockProductType(product),
    variants: [defaultVariant],
    defaultVariant,
    availableForOrder: product.availability !== "Sold Out",
    status: "published",
    availabilityStatus: formatAvailabilityStatus(product.availability),
    preparationTimeMinutes: null,
    sortOrder: 0,
    orderingNotes: null,
    createdAt: null,
    updatedAt: null,
  };
}

function toProductFromTrayPackage(pkg: MockTrayPackage): Product {
  const productType = pkg.type.toLowerCase();
  const category = productType === "tray" ? "Trays" : "Coolers";
  const defaultVariant = buildDefaultVariant({
    id: pkg.id,
    productId: Number(pkg.id.replace(/\D+/g, "")) || 0,
    name: pkg.name,
    servingSize: pkg.servingRange,
    price: pkg.price,
  });

  return {
    id: Number(pkg.id.replace(/\D+/g, "")) || 0,
    categoryId: null,
    slug: pkg.slug,
    name: pkg.name,
    category,
    categorySlug: slugify(category),
    shortDescription: pkg.shortDescription,
    description: pkg.shortDescription,
    basePrice: pkg.price,
    salePrice: null,
    effectivePrice: defaultVariant.effectivePrice,
    price: defaultVariant.effectivePrice,
    comparePrice: null,
    currencyCode: DEFAULT_CURRENCY_CODE,
    servingSize: pkg.servingRange,
    availability: "Available",
    isOrderable: true,
    image: pkg.image,
    primaryImage: null,
    media: [],
    featured: true,
    tags: [productType === "tray" ? "Party Ready" : "Bulk Service"],
    productType,
    variants: [defaultVariant],
    defaultVariant,
    availableForOrder: true,
    status: "published",
    availabilityStatus: "available",
    preparationTimeMinutes: null,
    sortOrder: 0,
    orderingNotes: null,
    createdAt: null,
    updatedAt: null,
  };
}

export const fallbackProducts: Product[] = [
  ...mockProducts.map(toProductFromMock),
  ...mockTrayPackages.map(toProductFromTrayPackage),
];

const fallbackProductMap = new Map(fallbackProducts.map((product) => [product.slug, product]));

const fallbackCategoryDescriptionMap: Record<string, string> = {
  "rice-dishes": "Signature rice dishes for individual orders and premium hospitality.",
  soups: "Comforting soups layered with depth, proteins, and heritage flavours.",
  "small-chops": "Celebration-ready finger foods for meetings, parties, and events.",
  proteins: "Premium proteins and platters for personal meals and hospitality service.",
  desserts: "Warm, polished dessert finishes with a premium VISEMFOOD touch.",
  trays: "Family and party trays built for every gathering.",
  coolers: "Bulk coolers for larger events, teams, and day-long service.",
};

export const fallbackCategories: Category[] = [
  ...mockCategoryFilters.filter((category) => category !== "All").map((category) => ({
    id: slugify(category),
    name: category,
    slug: slugify(category),
    description: fallbackCategoryDescriptionMap[slugify(category)] ?? `Explore ${category.toLowerCase()} from the VISEMFOOD kitchen.`,
    imageUrl: fallbackProducts.find((product) => product.category === category)?.image ?? "",
    imageMediaId: null,
    image: null,
    productsCount: fallbackProducts.filter((product) => product.category === category).length,
    status: "active" as const,
    sortOrder: fallbackProducts.findIndex((product) => product.category === category),
    createdAt: null,
    updatedAt: null,
  })),
  {
    id: "trays",
    name: "Trays",
    slug: "trays",
    description: fallbackCategoryDescriptionMap.trays,
    imageUrl: mockTrayPackages.find((pkg) => pkg.type === "Tray")?.image ?? "",
    imageMediaId: null,
    image: null,
    productsCount: 1,
    status: "active",
    sortOrder: 9998,
    createdAt: null,
    updatedAt: null,
  },
  {
    id: "coolers",
    name: "Coolers",
    slug: "coolers",
    description: fallbackCategoryDescriptionMap.coolers,
    imageUrl: mockTrayPackages.find((pkg) => pkg.type === "Cooler")?.image ?? "",
    imageMediaId: null,
    image: null,
    productsCount: 1,
    status: "active",
    sortOrder: 9999,
    createdAt: null,
    updatedAt: null,
  },
];

export const fallbackTrayPackages: TrayPackage[] = mockTrayPackages.map(toTrayPackageFromMock);

export const emptySiteMeta: SiteMeta = {
  name: "VISEMFOOD",
  tagline: "",
  phone: "",
  secondaryPhone: "",
  email: "",
  whatsappOrderNumber: "",
  whatsappContactNumber: "",
  whatsappOrderingEnabled: true,
  whatsappOrderIntro: "",
  address: "",
  city: "",
  stateRegion: "",
  country: "",
  hours: "",
  openingHours: createEmptyOpeningHours(),
  currencyCode: DEFAULT_CURRENCY_CODE,
  currencySymbol: DEFAULT_CURRENCY_CODE === "USD" ? "$" : DEFAULT_CURRENCY_CODE,
  currencyLocale: "en-US",
  deliveryInformation: "Pickup and delivery support are subject to current availability.",
  checkoutNotice: "You will continue to WhatsApp to confirm availability, delivery details and final pricing with our team.",
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    whatsapp: "",
  },
  seoDefaultTitle: "",
  seoDefaultDescription: "",
  defaultShareImageUrl: "",
};

export const fallbackSiteMeta: SiteMeta = {
  name: mockSiteMeta.name,
  tagline: "Authentic African Food",
  phone: mockSiteMeta.phone,
  secondaryPhone: "",
  email: mockSiteMeta.email,
  whatsappOrderNumber: digitsOnly(mockSiteMeta.phone),
  whatsappContactNumber: digitsOnly(mockSiteMeta.phone),
  whatsappOrderingEnabled: true,
  whatsappOrderIntro: "Hello VISEMFOOD, I would like to place an order.",
  address: mockSiteMeta.address,
  city: "",
  stateRegion: "",
  country: "",
  hours: mockSiteMeta.hours,
  openingHours: createEmptyOpeningHours(),
  currencyCode: DEFAULT_CURRENCY_CODE,
  currencySymbol: DEFAULT_CURRENCY_CODE === "USD" ? "$" : DEFAULT_CURRENCY_CODE,
  currencyLocale: "en-US",
  deliveryInformation: "Pickup and delivery support available for direct orders, trays, and catering.",
  checkoutNotice:
    "You will continue to WhatsApp to confirm availability, delivery details and final pricing with our team.",
  socialLinks: {
    instagram: "",
    facebook: "",
    tiktok: "",
    youtube: "",
    whatsapp: `https://wa.me/${digitsOnly(mockSiteMeta.phone)}`,
  },
  seoDefaultTitle: "",
  seoDefaultDescription: "",
  defaultShareImageUrl: "",
};

export const fallbackAdminOrders: AdminOrder[] = mockBulkOrders.map((order) => ({
  id: Number(order.id.replace(/\D+/g, "")) || 0,
  orderNumber: order.id,
  customer: order.customer,
  email: null,
  phone: "",
  deliveryType: "delivery",
  deliveryAddress: null,
  preferredFulfillmentAt: order.eventDate,
  customerNotes: null,
  adminNotes: null,
  estimatedTotal: order.total,
  finalTotal: null,
  total: order.total,
  subtotal: order.total,
  status:
    order.status === "Pending"
      ? "whatsapp_pending"
      : order.status === "Prep"
        ? "preparing"
        : order.status === "Ready"
          ? "ready"
          : "completed",
  statusLabel: order.status,
  itemCount: order.quantity,
  leadItemLabel: `${order.quantity} x ${order.packageName}`,
  items: [],
  createdAt: order.eventDate,
  orderedAt: order.eventDate,
  whatsappStartedAt: order.status === "Pending" ? order.eventDate : null,
}));

export const fallbackAdminCateringInquiries: AdminCateringInquiry[] = mockCateringRequests.map((request) => ({
  ...request,
  id: Number(request.id.replace(/\D+/g, "")) || 0,
  referenceNumber: request.id,
  email: "",
  phone: "",
  preferredService: null,
  location: null,
  requirements: null,
  notes: null,
  internalNotes: null,
  budgetAmount: null,
  packageId: null,
  packageName: null,
  packageSlug: null,
  packageStatus: null,
  packageStartingPrice: null,
  packageCurrencyCode: DEFAULT_CURRENCY_CODE,
  assignedToUserId: null,
  assignedToName: null,
  statusValue:
    request.status === "New"
      ? "new"
      : request.status === "Quoted"
        ? "quoted"
        : request.status === "Confirmed"
          ? "confirmed"
          : "completed",
  createdAt: request.eventDate,
  updatedAt: request.eventDate,
}));

function toCategory(apiCategory: ApiCategory): Category {
  return {
    id: String(apiCategory.id),
    name: apiCategory.name,
    slug: apiCategory.slug,
    description: apiCategory.description ?? "",
    imageUrl: apiCategory.image?.url ?? apiCategory.image_url ?? "",
    imageMediaId: apiCategory.image?.id ?? apiCategory.image_media_id ?? null,
    image: apiCategory.image ? toMediaAsset(apiCategory.image) : null,
    productsCount: apiCategory.products_count ?? 0,
    status: apiCategory.status === "inactive" ? "inactive" : "active",
    sortOrder: apiCategory.sort_order ?? 0,
    createdAt: apiCategory.created_at ?? null,
    updatedAt: apiCategory.updated_at ?? null,
  };
}

function toMediaAsset(asset: ApiMediaAsset): MediaAsset {
  const variants = Object.fromEntries(
    Object.entries(asset.variants ?? {}).map(([key, variant]) => [
      key,
      {
        path: variant?.path ?? "",
        url: variant?.url ?? "",
        width: variant?.width ?? null,
        height: variant?.height ?? null,
        sizeBytes: variant?.size_bytes ?? null,
      },
    ]),
  );

  return {
    id: asset.id,
    url: asset.url,
    path: asset.path ?? "",
    disk: asset.disk ?? null,
    storageDriver: asset.storage_driver ?? null,
    directory: asset.directory ?? null,
    filename: asset.filename ?? "",
    originalFilename: asset.original_filename ?? "",
    purpose: asset.purpose ?? null,
    altText: asset.alt_text,
    width: asset.width,
    height: asset.height,
    mimeType: asset.mime_type ?? null,
    extension: asset.extension ?? null,
    sizeBytes: asset.size_bytes ?? 0,
    variants,
    isPrimary: asset.is_primary ?? false,
    sortOrder: asset.sort_order ?? 0,
    metadata: asset.metadata ?? {},
    uploadedBy: asset.uploaded_by ?? null,
    usageCount: asset.usage_count ?? asset.usage?.total ?? 0,
    usage: {
      total: asset.usage?.total ?? 0,
      categories: asset.usage?.categories ?? 0,
      products: asset.usage?.products ?? 0,
      primaryProducts: asset.usage?.primary_products ?? 0,
      galleryProducts: asset.usage?.gallery_products ?? 0,
      contentSections: asset.usage?.content_sections ?? 0,
    },
    usedBy: asset.used_by
      ? {
          categories: asset.used_by.categories ?? [],
          products: asset.used_by.products ?? [],
          contentSections: (asset.used_by.content_sections ?? []).map((section) => ({
            id: section.id,
            sectionKey: section.section_key,
            title: section.title,
          })),
        }
      : null,
    createdAt: asset.created_at ?? null,
    updatedAt: asset.updated_at ?? null,
  };
}

function toVariant(apiVariant: ApiProductVariant): ProductVariant {
  const salePrice = apiVariant.sale_price ?? apiVariant.compare_price ?? null;
  const basePrice = apiVariant.base_price ?? apiVariant.price;
  const effectivePrice = apiVariant.effective_price ?? salePrice ?? apiVariant.price;

  return {
    id: apiVariant.id,
    productId: apiVariant.product_id ?? null,
    name: apiVariant.name,
    slug: apiVariant.slug,
    sku: apiVariant.sku ?? null,
    portionLabel: apiVariant.portion_label,
    description: apiVariant.description,
    basePrice,
    salePrice,
    effectivePrice,
    price: effectivePrice,
    comparePrice: salePrice,
    currencyCode: apiVariant.currency_code,
    availabilityStatus: apiVariant.availability_status,
    isDefault: apiVariant.is_default,
    sortOrder: apiVariant.sort_order,
    createdAt: apiVariant.created_at ?? null,
    updatedAt: apiVariant.updated_at ?? null,
  };
}

function deriveProductTags(apiProduct: ApiProduct, fallback?: Product) {
  const tags = [...(fallback?.tags ?? [])];

  if (tags.length === 0 && apiProduct.featured) {
    tags.push("Chef's Favourite");
  }

  if (/tray/i.test(apiProduct.product_type)) {
    tags.push("Party Ready");
  }

  if (/cooler/i.test(apiProduct.product_type)) {
    tags.push("Bulk Service");
  }

  if (/hosting_pack/i.test(apiProduct.product_type)) {
    tags.push("Event Essential");
  }

  if (apiProduct.availability_status === "limited") {
    tags.push("Limited Batch");
  }

  return uniqueValues(tags);
}

function toProduct(apiProduct: ApiProduct): Product {
  const fallback = fallbackProductMap.get(apiProduct.slug);
  const variants = (apiProduct.variants ?? []).map(toVariant);
  const explicitDefaultVariant = apiProduct.default_variant ? toVariant(apiProduct.default_variant) : null;
  const defaultVariant =
    explicitDefaultVariant ??
    variants.find((variant) => variant.isDefault) ??
    (apiProduct.variants === undefined && apiProduct.default_variant === undefined
      ? buildDefaultVariant({
          id: apiProduct.id,
          productId: apiProduct.id,
          name: apiProduct.name,
          servingSize: apiProduct.serving_size ?? fallback?.servingSize ?? "Standard",
          price: apiProduct.base_price,
          salePrice: apiProduct.sale_price ?? apiProduct.compare_price ?? null,
          currencyCode: apiProduct.currency_code,
          availabilityStatus: apiProduct.availability_status,
        })
      : null);
  const categoryName = apiProduct.category?.name ?? fallback?.category ?? titleCase(apiProduct.product_type);
  const salePrice = apiProduct.sale_price ?? apiProduct.compare_price ?? null;
  const effectivePrice = apiProduct.effective_price ?? defaultVariant?.effectivePrice ?? salePrice ?? apiProduct.base_price;
  const media = (apiProduct.media ?? []).map(toMediaAsset);
  const primaryImage =
    (apiProduct.primary_image ? toMediaAsset(apiProduct.primary_image) : null) ??
    media.find((asset) => asset.isPrimary) ??
    media[0] ??
    null;
  const preferredPrimaryUrl =
    primaryImage?.variants.medium?.url ||
    primaryImage?.variants.large?.url ||
    apiProduct.primary_image_url ||
    primaryImage?.url ||
    "";
  const hasSelectableVariants = variants.length > 0;
  const isOrderable =
    (apiProduct.is_orderable ?? false) ||
    ((apiProduct.available_for_order ?? false) &&
      apiProduct.availability_status !== "unavailable" &&
      hasSelectableVariants);

  return {
    id: apiProduct.id,
    categoryId: apiProduct.category_id ?? (apiProduct.category ? Number(apiProduct.category.id) : null),
    slug: apiProduct.slug,
    name: apiProduct.name,
    category: categoryName,
    categorySlug: apiProduct.category?.slug ?? fallback?.categorySlug ?? slugify(categoryName),
    shortDescription: apiProduct.short_description ?? fallback?.shortDescription ?? "",
    description: apiProduct.description ?? fallback?.description ?? apiProduct.short_description ?? "",
    basePrice: apiProduct.base_price,
    salePrice,
    effectivePrice,
    price: defaultVariant?.effectivePrice ?? effectivePrice,
    comparePrice: salePrice,
    currencyCode: apiProduct.currency_code,
    servingSize: defaultVariant?.portionLabel ?? apiProduct.serving_size ?? fallback?.servingSize ?? "Standard",
    availability: formatAvailabilityLabel(apiProduct.availability_status, isOrderable),
    isOrderable,
    image: preferredPrimaryUrl || fallback?.image || apiProduct.category?.image_url || "",
    primaryImage,
    media,
    featured: apiProduct.featured,
    tags: deriveProductTags(apiProduct, fallback),
    productType: apiProduct.product_type,
    variants,
    defaultVariant,
    availableForOrder: apiProduct.available_for_order,
    preparationTimeMinutes: apiProduct.preparation_time_minutes,
    sortOrder: apiProduct.sort_order ?? 0,
    orderingNotes: apiProduct.ordering_notes,
    status: apiProduct.status ?? "published",
    availabilityStatus: apiProduct.availability_status,
    createdAt: apiProduct.created_at ?? null,
    updatedAt: apiProduct.updated_at ?? null,
  };
}

function toTrayPackage(product: Product): TrayPackage {
  const type = product.productType === "cooler" ? "Cooler" : "Tray";

  return {
    id: String(product.id),
    slug: product.slug,
    name: product.name,
    type,
    price: product.price,
    servingRange: product.servingSize,
    shortDescription: product.shortDescription,
    notes:
      type === "Tray"
        ? ["Advance notice recommended", "Pickup or delivery support", "Custom add-ons available"]
        : ["Large-format service", "Ideal for teams and events", "Advance scheduling recommended"],
    image: product.image,
    availability: product.availability,
    productType: product.productType,
  };
}

function toSiteMeta(settings: ApiSiteSettings): SiteMeta {
  const whatsappOrderNumber =
    digitsOnly(settings.whatsapp_order_number) ||
    digitsOnly(settings.support_phone) ||
    emptySiteMeta.whatsappOrderNumber;
  const whatsappContactNumber =
    digitsOnly(settings.whatsapp_contact_number) ||
    whatsappOrderNumber ||
    emptySiteMeta.whatsappContactNumber;
  const addressParts = uniqueValues([settings.business_address, settings.city, settings.state_region, settings.country]);
  const openingHours = toOpeningHours(settings.opening_hours, settings.business_hours);
  const whatsappOrderingEnabled = settings.whatsapp_ordering_enabled ?? true;
  const whatsappUrl =
    whatsappOrderingEnabled && whatsappContactNumber ? `https://wa.me/${whatsappContactNumber}` : "";

  return {
    name: settings.business_name || emptySiteMeta.name,
    tagline: settings.tagline || emptySiteMeta.tagline,
    phone: settings.support_phone || emptySiteMeta.phone,
    secondaryPhone: settings.secondary_phone || emptySiteMeta.secondaryPhone,
    email: settings.support_email || emptySiteMeta.email,
    whatsappOrderNumber,
    whatsappContactNumber,
    whatsappOrderingEnabled,
    whatsappOrderIntro: settings.whatsapp_order_intro || emptySiteMeta.whatsappOrderIntro,
    address: settings.business_address || addressParts.join(", ") || emptySiteMeta.address,
    city: settings.city || emptySiteMeta.city,
    stateRegion: settings.state_region || emptySiteMeta.stateRegion,
    country: settings.country || emptySiteMeta.country,
    hours: settings.business_hours || emptySiteMeta.hours,
    openingHours,
    currencyCode: settings.currency_code || emptySiteMeta.currencyCode,
    currencySymbol: settings.currency_symbol || emptySiteMeta.currencySymbol,
    currencyLocale: settings.currency_locale || emptySiteMeta.currencyLocale,
    deliveryInformation: settings.delivery_information || emptySiteMeta.deliveryInformation,
    checkoutNotice: settings.checkout_notice || emptySiteMeta.checkoutNotice,
    seoDefaultTitle: settings.seo_default_title || emptySiteMeta.seoDefaultTitle,
    seoDefaultDescription: settings.seo_default_description || emptySiteMeta.seoDefaultDescription,
    defaultShareImageUrl: settings.default_share_image_url || emptySiteMeta.defaultShareImageUrl,
    socialLinks: {
      instagram: settings.social_links?.instagram ?? "",
      facebook: settings.social_links?.facebook ?? "",
      tiktok: settings.social_links?.tiktok ?? "",
      youtube: settings.social_links?.youtube ?? "",
      whatsapp: settings.social_links?.whatsapp ?? whatsappUrl,
    },
    createdAt: settings.created_at ?? null,
    updatedAt: settings.updated_at ?? null,
  };
}

function toAdminUser(user: ApiUser): AdminUser {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    phone: user.phone,
    role: user.role?.name ?? "Admin",
    roleSlug: user.role?.slug ?? "admin",
    status: user.status,
    permissions: user.permissions ?? [],
    lastLoginAt: user.last_login_at,
    twoFactorEnabled: user.two_factor_enabled,
    forcePasswordReset: user.force_password_reset,
  };
}

function toAdminOrder(apiOrder: ApiOrder): AdminOrder {
  const items = (apiOrder.items ?? []).map((item) => ({
    id: item.id,
    productName: item.product_name,
    variantName: item.variant_name,
    quantity: item.quantity,
    unitPrice: item.unit_price,
    lineTotal: item.line_total,
  }));
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);
  const leadItem = items[0];

  return {
    id: apiOrder.id,
    orderNumber: apiOrder.order_number,
    customer: apiOrder.customer_name,
    email: apiOrder.customer_email,
    phone: apiOrder.customer_phone,
    deliveryType: apiOrder.delivery_type,
    deliveryAddress: apiOrder.delivery_address,
    preferredFulfillmentAt: apiOrder.preferred_fulfillment_at,
    customerNotes: apiOrder.customer_notes,
    adminNotes: apiOrder.admin_notes,
    estimatedTotal: apiOrder.estimated_total,
    finalTotal: apiOrder.final_total,
    total: apiOrder.final_total ?? apiOrder.estimated_total,
    subtotal: apiOrder.subtotal,
    status: apiOrder.status,
    statusLabel: titleCase(apiOrder.status),
    itemCount,
    leadItemLabel: leadItem ? `${leadItem.quantity} x ${leadItem.productName}` : "Open order record",
    items,
    createdAt: apiOrder.created_at,
    orderedAt: apiOrder.ordered_at,
    whatsappStartedAt: apiOrder.whatsapp_started_at,
  };
}

function toCateringPackage(apiPackage: ApiCateringPackage): CateringPackage {
  return {
    id: apiPackage.id,
    name: apiPackage.name,
    slug: apiPackage.slug,
    shortDescription: apiPackage.short_description ?? "",
    description: apiPackage.description ?? "",
    startingPrice: apiPackage.starting_price,
    currencyCode: apiPackage.currency_code || DEFAULT_CURRENCY_CODE,
    minimumGuests: apiPackage.minimum_guests,
    maximumGuests: apiPackage.maximum_guests ?? null,
    inclusions: apiPackage.inclusions ?? [],
    featured: Boolean(apiPackage.featured),
    status: apiPackage.status === "inactive" ? "inactive" : "active",
    sortOrder: apiPackage.sort_order ?? 0,
    imageUrl: apiPackage.image?.url ?? apiPackage.image_url ?? "",
    imageMediaId: apiPackage.image?.id ?? apiPackage.image_media_id ?? null,
    image: apiPackage.image ? toMediaAsset(apiPackage.image) : null,
    inquiriesCount: apiPackage.inquiries_count ?? 0,
    createdAt: apiPackage.created_at ?? null,
    updatedAt: apiPackage.updated_at ?? null,
  };
}

function toPublicCateringInquiryReceipt(inquiry: ApiCateringInquiry): PublicCateringInquiryReceipt {
  return {
    id: inquiry.id,
    referenceNumber: inquiry.reference_number,
    customerName: inquiry.customer_name,
    eventType: inquiry.event_type,
    eventDate: inquiry.event_date ?? null,
    guestCount: inquiry.number_of_guests ?? null,
    preferredService: inquiry.preferred_service ?? null,
    location: inquiry.location ?? null,
    packageId: inquiry.catering_package?.id ?? null,
    packageName: inquiry.catering_package?.name ?? null,
    packageSlug: inquiry.catering_package?.slug ?? null,
    createdAt: inquiry.created_at ?? null,
  };
}

function toAdminCateringInquiry(inquiry: ApiCateringInquiry): AdminCateringInquiry {
  return {
    id: inquiry.id,
    referenceNumber: inquiry.reference_number,
    client: inquiry.customer_name,
    eventType: inquiry.event_type,
    eventDate: inquiry.event_date?.slice(0, 10) ?? "",
    guests: inquiry.number_of_guests ?? 0,
    status: titleCase(inquiry.status ?? "new"),
    budget:
      inquiry.budget?.trim() ||
      (inquiry.budget_amount !== undefined && inquiry.budget_amount !== null
        ? formatCurrency(inquiry.budget_amount, {
            currency: inquiry.catering_package?.currency_code || DEFAULT_CURRENCY_CODE,
          })
        : "Budget on request"),
    budgetAmount: inquiry.budget_amount ?? null,
    email: inquiry.email ?? "",
    phone: inquiry.phone ?? "",
    preferredService: inquiry.preferred_service ?? null,
    location: inquiry.location ?? null,
    requirements: inquiry.requirements ?? null,
    notes: inquiry.notes ?? null,
    internalNotes: inquiry.internal_notes ?? null,
    statusValue: inquiry.status ?? "new",
    packageId: inquiry.catering_package?.id ?? null,
    packageName: inquiry.catering_package?.name ?? null,
    packageSlug: inquiry.catering_package?.slug ?? null,
    packageStatus: inquiry.catering_package?.status ?? null,
    packageStartingPrice: inquiry.catering_package?.starting_price ?? null,
    packageCurrencyCode: inquiry.catering_package?.currency_code || DEFAULT_CURRENCY_CODE,
    assignedToUserId: inquiry.assigned_to?.id ?? null,
    assignedToName: inquiry.assigned_to?.name ?? null,
    createdAt: inquiry.created_at,
    updatedAt: inquiry.updated_at ?? inquiry.created_at,
  };
}

function toAdminContactMessage(message: ApiContactMessage): AdminContactMessage {
  return {
    id: message.id,
    referenceNumber: message.reference_number,
    name: message.name,
    email: message.email,
    phone: message.phone,
    subject: message.subject,
    message: message.message,
    status: message.status,
    statusLabel: titleCase(message.status),
    createdAt: message.created_at,
  };
}

function toAdminDashboard(dashboard: ApiDashboard): AdminDashboard {
  return {
    stats: {
      productsTotal: dashboard.stats.products_total,
      productsAvailable: dashboard.stats.products_available,
      ordersTotal: dashboard.stats.orders_total,
      ordersPendingWhatsApp: dashboard.stats.orders_pending_whatsapp,
      ordersConfirmed: dashboard.stats.orders_confirmed,
      ordersCompleted: dashboard.stats.orders_completed,
      cateringNew: dashboard.stats.catering_new,
      contactUnread: dashboard.stats.contact_unread,
    },
    recentOrders: dashboard.recent_orders.map(toAdminOrder),
    recentCatering: dashboard.recent_catering.map(toAdminCateringInquiry),
    recentContactMessages: dashboard.recent_contact_messages.map(toAdminContactMessage),
  };
}

function getPagination(meta: Record<string, unknown> | undefined) {
  const pagination = meta?.pagination;

  if (!pagination || typeof pagination !== "object") {
    return null;
  }

  return pagination as PaginationMeta;
}

function buildQuery(params: Record<string, string | number | boolean | Array<string | number | boolean> | null | undefined>) {
  const search = new URLSearchParams();
  const normalizeEntry = (entry: string | number | boolean) => (typeof entry === "boolean" ? (entry ? "1" : "0") : String(entry).trim());

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    if (Array.isArray(value)) {
      const normalizedValues = value.map(normalizeEntry).filter(Boolean);

      if (normalizedValues.length === 0) {
        return;
      }

      search.set(key, normalizedValues.join(","));
      return;
    }

    search.set(key, normalizeEntry(value));
  });

  const query = search.toString();
  return query ? `?${query}` : "";
}

export function getProductTone(availability: Product["availability"]) {
  if (availability === "Available") {
    return "success" as const;
  }

  if (availability === "Limited") {
    return "warning" as const;
  }

  return "danger" as const;
}

export function getOrderTone(status: string) {
  if (status === "completed" || status === "confirmed") {
    return "success" as const;
  }

  if (status === "preparing" || status === "ready" || status === "negotiating") {
    return "warning" as const;
  }

  if (status === "cancelled") {
    return "danger" as const;
  }

  return "neutral" as const;
}

export function getCateringTone(status: string) {
  if (status === "confirmed" || status === "completed") {
    return "success" as const;
  }

  if (status === "quoted" || status === "contacted") {
    return "warning" as const;
  }

  if (status === "cancelled") {
    return "danger" as const;
  }

  return "neutral" as const;
}

export function getInitials(name: string) {
  const initials = name
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase() ?? "")
    .join("");

  return initials || "AD";
}

export async function fetchSiteSettings() {
  const { data } = await apiRequest<ApiSiteSettings>("/api/v1/site-settings");
  return toSiteMeta(data);
}

export async function fetchCategories() {
  const { data } = await apiRequest<ApiCategory[]>("/api/v1/categories");
  return data.map(toCategory);
}

export async function fetchProducts(params: {
  category?: string;
  search?: string;
  featured?: boolean;
  productType?: string | string[];
  perPage?: number;
  availableOnly?: boolean;
} = {}) {
  const query = buildQuery({
    category: params.category,
    search: params.search,
    featured: params.featured,
    product_type: params.productType,
    per_page: params.perPage ?? 48,
    available_only: params.availableOnly ?? true,
  });
  const { data, meta } = await apiRequest<ApiProduct[]>(`/api/v1/products${query}`);

  return {
    items: data.map(toProduct),
    pagination: getPagination(meta),
  };
}

export async function fetchProductBySlug(slug: string) {
  const { data } = await apiRequest<ApiProduct>(`/api/v1/products/${slug}`);
  return toProduct(data);
}

export async function fetchCateringPackages() {
  const { data } = await apiRequest<ApiCateringPackage[]>("/api/v1/catering-packages");
  return data.map(toCateringPackage);
}

export async function fetchPublicCatalog() {
  const [siteMeta, categories, productsResult] = await Promise.all([
    fetchSiteSettings(),
    fetchCategories(),
    fetchProducts({ perPage: 48, availableOnly: true }),
  ]);

  const trayPackages = productsResult.items
    .filter((product) => product.productType === "tray" || product.productType === "cooler")
    .map(toTrayPackage);

  return {
    siteMeta,
    categories,
    products: productsResult.items,
    trayPackages,
  };
}

export async function submitContactMessage(payload: {
  name: string;
  email: string;
  phone?: string | null;
  subject: string;
  event_date?: string | null;
  guest_count?: number | null;
  message: string;
}) {
  const { data, message } = await apiRequest<ApiContactMessage>("/api/v1/contact", {
    method: "POST",
    body: payload,
  });

  return {
    message,
    data: toAdminContactMessage(data),
  };
}

export async function submitCateringInquiry(payload: {
  catering_package_id?: number | null;
  customer_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date?: string | null;
  number_of_guests?: number | null;
  preferred_service?: string | null;
  location?: string | null;
  budget?: string | null;
  budget_amount?: number | null;
  requirements?: string | null;
  notes?: string | null;
}) {
  const { data, message } = await apiRequest<ApiCateringInquiry>("/api/v1/catering", {
    method: "POST",
    body: payload,
  });

  return {
    message,
    data: toPublicCateringInquiryReceipt(data),
  };
}

export async function loginAdmin(credentials: { email: string; password: string }) {
  const { data, message } = await apiRequest<{
    user: ApiUser;
    requires_two_factor: boolean;
    session_lifetime_minutes: number;
  }>("/api/v1/admin/login", {
    method: "POST",
    body: credentials,
    requiresCsrf: true,
  });

  return {
    message,
    user: toAdminUser(data.user),
    requiresTwoFactor: data.requires_two_factor,
    sessionLifetimeMinutes: data.session_lifetime_minutes,
  };
}

export async function fetchCurrentAdminUser() {
  const { data } = await apiRequest<ApiUser>("/api/v1/admin/me");
  return toAdminUser(data);
}

export async function logoutAdmin() {
  const { message } = await apiRequest<null>("/api/v1/admin/logout", {
    method: "POST",
    requiresCsrf: true,
  });

  return message;
}

export async function fetchAdminDashboard() {
  const { data } = await apiRequest<ApiDashboard>("/api/v1/admin/dashboard");
  return toAdminDashboard(data);
}

export async function fetchAdminSiteSettings() {
  const { data } = await apiRequest<ApiSiteSettings>("/api/v1/admin/settings");
  return toSiteMeta(data);
}

export async function updateAdminSiteSettings(payload: SiteSettingsUpdateInput) {
  const { data, message } = await apiRequest<ApiSiteSettings>("/api/v1/admin/settings", {
    method: "PUT",
    requiresCsrf: true,
    body: {
      business_name: payload.name,
      tagline: payload.tagline || null,
      support_email: payload.email || null,
      support_phone: payload.phone || null,
      secondary_phone: payload.secondaryPhone || null,
      whatsapp_order_number: payload.whatsappNumber || null,
      whatsapp_contact_number: payload.whatsappContactNumber || null,
      whatsapp_ordering_enabled: payload.whatsappOrderingEnabled,
      whatsapp_order_intro: payload.whatsappOrderIntro || null,
      business_address: payload.address || null,
      city: payload.city || null,
      state_region: payload.stateRegion || null,
      country: payload.country || null,
      opening_hours: Object.fromEntries(
        Object.entries(payload.openingHours).map(([day, entry]) => [
          day,
          {
            is_open: entry.isOpen,
            opens_at: entry.isOpen ? entry.opensAt || null : null,
            closes_at: entry.isOpen ? entry.closesAt || null : null,
          },
        ]),
      ),
      currency_code: "USD",
      currency_symbol: "$",
      currency_locale: "en-US",
      delivery_information: payload.deliveryInformation || null,
      checkout_notice: payload.checkoutNotice || null,
      social_links: payload.socialLinks,
      seo_default_title: payload.seoDefaultTitle || null,
      seo_default_description: payload.seoDefaultDescription || null,
      default_share_image_url: payload.defaultShareImageUrl || null,
    },
  });

  return {
    message,
    settings: toSiteMeta(data),
  };
}

export async function fetchAdminCategories(params: {
  search?: string;
  status?: string;
  perPage?: number;
} = {}) {
  const query = buildQuery({
    search: params.search,
    status: params.status,
    per_page: params.perPage ?? 100,
  });
  const { data, meta } = await apiRequest<ApiCategory[]>(`/api/v1/admin/categories${query}`);

  return {
    items: data.map(toCategory),
    pagination: getPagination(meta),
  };
}

export async function fetchAdminCategory(categoryId: string) {
  const { data } = await apiRequest<ApiCategory>(`/api/v1/admin/categories/${categoryId}`);
  return toCategory(data);
}

export async function createAdminCategory(payload: CategoryInput) {
  const { data, message } = await apiRequest<ApiCategory>("/api/v1/admin/categories", {
    method: "POST",
    requiresCsrf: true,
    body: {
      name: payload.name,
      slug: payload.slug?.trim() || null,
      description: payload.description?.trim() || null,
      status: payload.status,
      sort_order: payload.sortOrder ?? 0,
      image_media_id: payload.imageMediaId ?? null,
    },
  });

  return {
    message,
    category: toCategory(data),
  };
}

export async function updateAdminCategory(categoryId: string, payload: CategoryInput) {
  const { data, message } = await apiRequest<ApiCategory>(`/api/v1/admin/categories/${categoryId}`, {
    method: "PUT",
    requiresCsrf: true,
    body: {
      name: payload.name,
      slug: payload.slug?.trim() || null,
      description: payload.description?.trim() || null,
      status: payload.status,
      sort_order: payload.sortOrder ?? 0,
      image_media_id: payload.imageMediaId ?? null,
    },
  });

  return {
    message,
    category: toCategory(data),
  };
}

export async function updateAdminCategoryStatus(category: Category, status: Category["status"]) {
  return updateAdminCategory(category.id, {
    name: category.name,
    slug: category.slug,
    description: category.description,
    status,
    sortOrder: category.sortOrder,
    imageMediaId: category.imageMediaId,
  });
}

export async function deleteAdminCategory(categoryId: string) {
  const { message } = await apiRequest<null>(`/api/v1/admin/categories/${categoryId}`, {
    method: "DELETE",
    requiresCsrf: true,
  });

  return message;
}

export async function fetchAdminMediaSpecs() {
  const { data } = await apiRequest<Record<string, {
    label?: string;
    width?: number;
    height?: number;
    ratio?: string;
    max_size_kb?: number;
    min_width?: number;
    min_height?: number;
    formats?: string[];
    variants?: Record<string, { width: number; height: number }>;
  }>>("/api/v1/admin/media/specs");

  return Object.fromEntries(
    Object.entries(data).map(([key, spec]) => [
      key,
      {
        label: spec.label ?? key,
        width: spec.width ?? 0,
        height: spec.height ?? 0,
        ratio: spec.ratio ?? "",
        maxSizeKb: spec.max_size_kb ?? 0,
        minWidth: spec.min_width ?? 0,
        minHeight: spec.min_height ?? 0,
        formats: spec.formats ?? [],
        variants: spec.variants ?? {},
      } satisfies MediaSpec,
    ]),
  ) as Record<string, MediaSpec>;
}

export async function uploadAdminMediaAsset(file: File, options: { spec: string; altText?: string }) {
  const formData = new FormData();
  formData.append("file", file);
  formData.append("spec", options.spec);

  if (options.altText?.trim()) {
    formData.append("alt_text", options.altText.trim());
  }

  const { data, message } = await apiRequest<{
    asset: ApiMediaAsset;
    spec: {
      label?: string;
      width?: number;
      height?: number;
      ratio?: string;
      max_size_kb?: number;
      min_width?: number;
      min_height?: number;
      formats?: string[];
      variants?: Record<string, { width: number; height: number }>;
    };
  }>("/api/v1/admin/media", {
    method: "POST",
    requiresCsrf: true,
    body: formData,
  });

  return {
    message,
    asset: toMediaAsset(data.asset),
    spec: {
      label: data.spec.label ?? options.spec,
      width: data.spec.width ?? 0,
      height: data.spec.height ?? 0,
      ratio: data.spec.ratio ?? "",
      maxSizeKb: data.spec.max_size_kb ?? 0,
      minWidth: data.spec.min_width ?? 0,
      minHeight: data.spec.min_height ?? 0,
      formats: data.spec.formats ?? [],
      variants: data.spec.variants ?? {},
    } satisfies MediaSpec,
  };
}

export async function fetchAdminMediaAssets(params: {
  search?: string;
  purpose?: string;
  perPage?: number;
} = {}) {
  const query = new URLSearchParams();

  if (params.search) {
    query.set("search", params.search);
  }

  if (params.purpose && params.purpose !== "all") {
    query.set("purpose", params.purpose);
  }

  if (params.perPage) {
    query.set("per_page", String(params.perPage));
  }

  const suffix = query.size > 0 ? `?${query.toString()}` : "";
  const { data, meta } = await apiRequest<ApiMediaAsset[]>(`/api/v1/admin/media${suffix}`);

  return {
    items: data.map(toMediaAsset),
    pagination: meta?.pagination as PaginationMeta | undefined,
  };
}

export async function fetchAdminMediaAsset(mediaId: number | string) {
  const { data } = await apiRequest<ApiMediaAsset>(`/api/v1/admin/media/${mediaId}`);

  return toMediaAsset(data);
}

export async function deleteAdminMediaAsset(mediaId: number | string) {
  const { message } = await apiRequest<undefined>(`/api/v1/admin/media/${mediaId}`, {
    method: "DELETE",
    requiresCsrf: true,
  });

  return message;
}

function toAdminProductPayload(payload: ProductInput) {
  const primaryMediaId = payload.primaryMediaId ?? null;
  const mediaIds = Array.from(
    new Set([...(payload.mediaIds ?? []), ...(primaryMediaId !== null ? [primaryMediaId] : [])]),
  );

  return {
    category_id: payload.categoryId,
    product_type: payload.productType,
    name: payload.name,
    slug: payload.slug?.trim() || null,
    short_description: payload.shortDescription?.trim() || null,
    description: payload.description?.trim() || null,
    base_price: payload.basePrice,
    compare_price: payload.salePrice ?? null,
    currency_code: DEFAULT_CURRENCY_CODE,
    serving_size: payload.servingSize?.trim() || null,
    status: payload.status,
    availability_status: payload.availabilityStatus,
    featured: payload.featured,
    available_for_order: payload.availableForOrder,
    preparation_time_minutes: payload.preparationTimeMinutes ?? null,
    sort_order: payload.sortOrder ?? 0,
    ordering_notes: payload.orderingNotes?.trim() || null,
    primary_media_id: primaryMediaId,
    media_ids: mediaIds,
    variants: payload.variants.map((variant, index) => ({
      id: variant.id ?? null,
      name: variant.name,
      sku: variant.sku?.trim() || null,
      portion_label: variant.portionLabel?.trim() || null,
      description: variant.description?.trim() || null,
      price: variant.price,
      compare_price: variant.salePrice ?? null,
      availability_status: variant.availabilityStatus ?? "available",
      is_default: variant.isDefault ?? index === 0,
      sort_order: variant.sortOrder ?? index,
    })),
  };
}

export async function fetchAdminProducts(params: {
  categoryId?: string;
  search?: string;
  status?: string;
  availabilityStatus?: string;
  featured?: boolean;
  productType?: string | string[];
  perPage?: number;
} = {}) {
  const query = buildQuery({
    category_id: params.categoryId,
    search: params.search,
    status: params.status,
    availability_status: params.availabilityStatus,
    featured: params.featured,
    product_type: params.productType,
    per_page: params.perPage ?? 100,
  });
  const { data, meta } = await apiRequest<ApiProduct[]>(`/api/v1/admin/products${query}`);

  return {
    items: data.map(toProduct),
    pagination: getPagination(meta),
  };
}

export async function fetchAdminProduct(productId: string | number) {
  const { data } = await apiRequest<ApiProduct>(`/api/v1/admin/products/${productId}`);
  return toProduct(data);
}

export async function createAdminProduct(payload: ProductInput) {
  const { data, message } = await apiRequest<ApiProduct>("/api/v1/admin/products", {
    method: "POST",
    requiresCsrf: true,
    body: toAdminProductPayload(payload),
  });

  return {
    message,
    product: toProduct(data),
  };
}

export async function updateAdminProduct(productId: string | number, payload: ProductInput) {
  const { data, message } = await apiRequest<ApiProduct>(`/api/v1/admin/products/${productId}`, {
    method: "PUT",
    requiresCsrf: true,
    body: toAdminProductPayload(payload),
  });

  return {
    message,
    product: toProduct(data),
  };
}

export async function updateAdminProductAvailability(
  productId: string | number,
  payload: {
    availabilityStatus: string;
    status?: string;
    availableForOrder?: boolean;
  },
) {
  const { data, message } = await apiRequest<ApiProduct>(`/api/v1/admin/products/${productId}/availability`, {
    method: "PATCH",
    requiresCsrf: true,
    body: {
      availability_status: payload.availabilityStatus,
      status: payload.status,
      available_for_order: payload.availableForOrder,
    },
  });

  return {
    message,
    product: toProduct(data),
  };
}

export async function deleteAdminProduct(productId: string | number) {
  const { message } = await apiRequest<null>(`/api/v1/admin/products/${productId}`, {
    method: "DELETE",
    requiresCsrf: true,
  });

  return message;
}

function toAdminCateringPackagePayload(payload: CateringPackageInput) {
  return {
    name: payload.name,
    slug: payload.slug?.trim() || null,
    short_description: payload.shortDescription?.trim() || null,
    description: payload.description?.trim() || null,
    starting_price: payload.startingPrice,
    minimum_guests: payload.minimumGuests,
    maximum_guests: payload.maximumGuests ?? null,
    inclusions: (payload.inclusions ?? []).map((value) => value.trim()).filter(Boolean),
    image_media_id: payload.imageMediaId ?? null,
    featured: payload.featured,
    status: payload.status,
    sort_order: payload.sortOrder ?? 0,
  };
}

export async function fetchAdminCateringPackages(params: {
  status?: string;
  featured?: boolean;
  search?: string;
  perPage?: number;
} = {}) {
  const query = buildQuery({
    status: params.status,
    featured: params.featured,
    search: params.search,
    per_page: params.perPage ?? 100,
  });
  const { data, meta } = await apiRequest<ApiCateringPackage[]>(`/api/v1/admin/catering-packages${query}`);

  return {
    items: data.map(toCateringPackage),
    pagination: getPagination(meta),
  };
}

export async function fetchAdminCateringPackage(packageId: number | string) {
  const { data } = await apiRequest<ApiCateringPackage>(`/api/v1/admin/catering-packages/${packageId}`);
  return toCateringPackage(data);
}

export async function createAdminCateringPackage(payload: CateringPackageInput) {
  const { data, message } = await apiRequest<ApiCateringPackage>("/api/v1/admin/catering-packages", {
    method: "POST",
    requiresCsrf: true,
    body: toAdminCateringPackagePayload(payload),
  });

  return {
    message,
    cateringPackage: toCateringPackage(data),
  };
}

export async function updateAdminCateringPackage(packageId: number | string, payload: CateringPackageInput) {
  const { data, message } = await apiRequest<ApiCateringPackage>(`/api/v1/admin/catering-packages/${packageId}`, {
    method: "PUT",
    requiresCsrf: true,
    body: toAdminCateringPackagePayload(payload),
  });

  return {
    message,
    cateringPackage: toCateringPackage(data),
  };
}

export async function deleteAdminCateringPackage(packageId: number | string) {
  const { message } = await apiRequest<null>(`/api/v1/admin/catering-packages/${packageId}`, {
    method: "DELETE",
    requiresCsrf: true,
  });

  return message;
}

export async function fetchAdminOrders(params: {
  status?: string;
  deliveryType?: string;
  search?: string;
  from?: string;
  to?: string;
  perPage?: number;
} = {}) {
  const query = buildQuery({
    status: params.status,
    delivery_type: params.deliveryType,
    search: params.search,
    from: params.from,
    to: params.to,
    per_page: params.perPage ?? 100,
  });
  const { data, meta } = await apiRequest<ApiOrder[]>(`/api/v1/admin/orders${query}`);

  return {
    items: data.map(toAdminOrder),
    pagination: getPagination(meta),
  };
}

export async function fetchAdminCateringInquiries(params: {
  status?: string;
  cateringPackageId?: number | string;
  search?: string;
  eventDate?: string;
  from?: string;
  to?: string;
  perPage?: number;
} = {}) {
  const query = buildQuery({
    status: params.status,
    catering_package_id: params.cateringPackageId,
    search: params.search,
    event_date: params.eventDate,
    from: params.from,
    to: params.to,
    per_page: params.perPage ?? 100,
  });
  const { data, meta } = await apiRequest<ApiCateringInquiry[]>(`/api/v1/admin/catering-inquiries${query}`);

  return {
    items: data.map(toAdminCateringInquiry),
    pagination: getPagination(meta),
  };
}

export async function fetchAdminCateringInquiry(inquiryId: number | string) {
  const { data } = await apiRequest<ApiCateringInquiry>(`/api/v1/admin/catering-inquiries/${inquiryId}`);
  return toAdminCateringInquiry(data);
}

export async function updateAdminCateringInquiry(
  inquiryId: number | string,
  payload: {
    status: string;
    assignedToUserId?: number | null;
    internalNotes?: string | null;
  },
) {
  const { data, message } = await apiRequest<ApiCateringInquiry>(`/api/v1/admin/catering-inquiries/${inquiryId}`, {
    method: "PATCH",
    requiresCsrf: true,
    body: {
      status: payload.status,
      assigned_to_user_id: payload.assignedToUserId ?? null,
      internal_notes: payload.internalNotes ?? null,
    },
  });

  return {
    message,
    inquiry: toAdminCateringInquiry(data),
  };
}

export async function fetchAdminContactMessages(params: {
  status?: string;
  search?: string;
  unreadOnly?: boolean;
  perPage?: number;
} = {}) {
  const query = buildQuery({
    status: params.status,
    search: params.search,
    unread_only: params.unreadOnly,
    per_page: params.perPage ?? 100,
  });
  const { data, meta } = await apiRequest<ApiContactMessage[]>(`/api/v1/admin/contact-messages${query}`);

  return {
    items: data.map(toAdminContactMessage),
    pagination: getPagination(meta),
  };
}


export type CheckoutPreviewCartItem = {
  product_id: number;
  slug: string;
  variant_id: number | null;
  quantity: number;
};

export type CheckoutPreviewPayload = {
  order_number?: string;
  customer_name: string;
  customer_email?: string | null;
  customer_phone: string;
  delivery_type: "pickup" | "delivery";
  delivery_address?: string | null;
  preferred_fulfillment_at?: string | null;
  customer_notes?: string | null;
  items: CheckoutPreviewCartItem[];
};

type ApiCheckoutPreviewLineItem = {
  product_id: number;
  product_variant_id: number | null;
  product_name: string;
  variant_name: string | null;
  unit_price: number;
  quantity: number;
  line_total: number;
  meta?: {
    slug?: string | null;
  } | null;
};

type ApiCheckoutPreviewResponse = {
  order: ApiOrder;
  line_items: ApiCheckoutPreviewLineItem[];
  totals: {
    subtotal: number;
    delivery_fee: number;
    discount_amount: number;
    estimated_total: number;
  };
  whatsapp_number: string | null;
};

export type CheckoutPreviewLineItem = {
  productId: number;
  variantId: number | null;
  productName: string;
  variantName: string | null;
  unitPrice: number;
  quantity: number;
  lineTotal: number;
  slug: string | null;
};

export type CheckoutPreviewResult = {
  orderNumber: string;
  currencyCode: string;
  lineItems: CheckoutPreviewLineItem[];
  totals: {
    subtotal: number;
    deliveryFee: number;
    discountAmount: number;
    estimatedTotal: number;
  };
  whatsappNumber: string | null;
};

export type CheckoutWhatsAppResult = {
  orderNumber: string;
  whatsappNumber: string | null;
  whatsappUrl: string;
  message: string;
};

function toCheckoutPreviewLineItem(item: ApiCheckoutPreviewLineItem): CheckoutPreviewLineItem {
  return {
    productId: item.product_id,
    variantId: item.product_variant_id,
    productName: item.product_name,
    variantName: item.variant_name,
    unitPrice: item.unit_price,
    quantity: item.quantity,
    lineTotal: item.line_total,
    slug: item.meta?.slug ?? null,
  };
}

export async function previewCheckout(payload: CheckoutPreviewPayload): Promise<CheckoutPreviewResult> {
  const { data } = await apiRequest<ApiCheckoutPreviewResponse>("/api/v1/checkout/preview", {
    method: "POST",
    body: payload,
    requiresCsrf: true,
  });

  return {
    orderNumber: data.order.order_number,
    currencyCode: data.order.currency_code || DEFAULT_CURRENCY_CODE,
    lineItems: data.line_items.map(toCheckoutPreviewLineItem),
    totals: {
      subtotal: data.totals.subtotal,
      deliveryFee: data.totals.delivery_fee,
      discountAmount: data.totals.discount_amount,
      estimatedTotal: data.totals.estimated_total,
    },
    whatsappNumber: data.whatsapp_number,
  };
}

type ApiCheckoutWhatsAppResponse = {
  order: ApiOrder;
  whatsapp: {
    number: string;
    message: string;
    url: string;
  };
};

export async function continueCheckoutOnWhatsApp(orderNumber: string): Promise<CheckoutWhatsAppResult> {
  const { data } = await apiRequest<ApiCheckoutWhatsAppResponse>(`/api/v1/checkout/${orderNumber}/whatsapp`, {
    method: "POST",
    requiresCsrf: true,
  });

  return {
    orderNumber: data.order.order_number,
    whatsappNumber: data.whatsapp.number,
    whatsappUrl: data.whatsapp.url,
    message: data.whatsapp.message,
  };
}



