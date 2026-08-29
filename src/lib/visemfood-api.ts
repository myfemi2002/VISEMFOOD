import {
  bulkOrders as mockBulkOrders,
  cateringRequests as mockCateringRequests,
  categoryFilters as mockCategoryFilters,
  products as mockProducts,
  siteMeta as mockSiteMeta,
  trayPackages as mockTrayPackages,
  type BulkOrder as MockBulkOrder,
  type Product as MockProduct,
  type TrayPackage as MockTrayPackage,
} from "@/data/mock";
import { apiRequest } from "@/lib/api";

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
  status: string;
  sort_order: number;
  image_url: string | null;
  products_count?: number;
};

type ApiMediaAsset = {
  id: number;
  url: string;
  alt_text: string | null;
  width: number | null;
  height: number | null;
};

type ApiProductVariant = {
  id: number;
  name: string;
  slug: string | null;
  portion_label: string | null;
  description: string | null;
  price: number;
  compare_price: number | null;
  currency_code: string;
  availability_status: string;
  is_default: boolean;
  sort_order: number;
};

type ApiProduct = {
  id: number;
  name: string;
  slug: string;
  product_type: string;
  short_description: string | null;
  description: string | null;
  base_price: number;
  compare_price: number | null;
  currency_code: string;
  serving_size: string | null;
  status: string;
  availability_status: string;
  featured: boolean;
  available_for_order: boolean;
  preparation_time_minutes: number | null;
  sort_order: number;
  ordering_notes: string | null;
  category?: ApiCategory;
  variants?: ApiProductVariant[];
  default_variant?: ApiProductVariant | null;
  media?: ApiMediaAsset[];
  primary_image?: ApiMediaAsset | null;
  primary_image_url?: string | null;
};

type ApiSiteSettings = {
  business_name: string | null;
  support_email: string | null;
  support_phone: string | null;
  whatsapp_order_number: string | null;
  whatsapp_contact_number: string | null;
  business_address: string | null;
  business_hours: string | null;
  currency_code: string | null;
  currency_symbol: string | null;
  delivery_information: string | null;
  checkout_notice: string | null;
  social_links: Record<string, string> | null;
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
  email: string;
  phone: string;
  event_type: string;
  event_date: string | null;
  number_of_guests: number | null;
  preferred_service: string | null;
  location: string | null;
  budget: string | null;
  requirements: string | null;
  notes: string | null;
  status: string;
  internal_notes: string | null;
  created_at: string | null;
  updated_at: string | null;
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
  productsCount: number;
};

export type ProductVariant = {
  id: number;
  name: string;
  slug: string | null;
  portionLabel: string | null;
  description: string | null;
  price: number;
  comparePrice: number | null;
  currencyCode: string;
  availabilityStatus: string;
  isDefault: boolean;
  sortOrder: number;
};

export type Product = MockProduct & {
  categorySlug: string;
  productType: string;
  variants: ProductVariant[];
  defaultVariant: ProductVariant | null;
  availableForOrder: boolean;
  comparePrice: number | null;
  currencyCode: string;
  status: string;
  availabilityStatus: string;
};

export type TrayPackage = MockTrayPackage & {
  availability: Product["availability"];
  productType: string;
};

export type SiteMeta = {
  name: string;
  phone: string;
  email: string;
  whatsappOrderNumber: string;
  whatsappContactNumber: string;
  address: string;
  hours: string;
  currencyCode: string;
  currencySymbol: string;
  deliveryInformation: string;
  checkoutNotice: string;
  socialLinks: Record<string, string>;
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
  id: string;
  referenceNumber: string;
  client: string;
  eventType: string;
  eventDate: string;
  guests: number;
  status: string;
  budget: string;
  email: string;
  phone: string;
  preferredService: string | null;
  location: string | null;
  requirements: string | null;
  notes: string | null;
  internalNotes: string | null;
  statusValue: string;
  createdAt: string | null;
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

const defaultSocialLinks = {
  instagram: "https://instagram.com",
  facebook: "https://facebook.com",
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
  name: string;
  servingSize: string;
  price: number;
  currencyCode?: string;
  availabilityStatus?: string;
}): ProductVariant {
  const numericId = typeof input.id === "number" ? input.id : Number(input.id.toString().replace(/\D+/g, "")) || 0;

  return {
    id: numericId,
    name: input.servingSize || input.name,
    slug: slugify(input.servingSize || input.name),
    portionLabel: input.servingSize,
    description: null,
    price: input.price,
    comparePrice: null,
    currencyCode: input.currencyCode ?? "NGN",
    availabilityStatus: input.availabilityStatus ?? "available",
    isDefault: true,
    sortOrder: 0,
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
    name: product.name,
    servingSize: product.servingSize,
    price: product.price,
    availabilityStatus: formatAvailabilityStatus(product.availability),
  });

  return {
    ...product,
    categorySlug: slugify(product.category),
    productType: inferMockProductType(product),
    variants: [defaultVariant],
    defaultVariant,
    availableForOrder: product.availability !== "Sold Out",
    comparePrice: null,
    currencyCode: "NGN",
    status: "published",
    availabilityStatus: formatAvailabilityStatus(product.availability),
    tags: product.tags ?? [],
  };
}

function toProductFromTrayPackage(pkg: MockTrayPackage): Product {
  const productType = pkg.type.toLowerCase();
  const category = productType === "tray" ? "Trays" : "Coolers";
  const defaultVariant = buildDefaultVariant({
    id: pkg.id,
    name: pkg.name,
    servingSize: pkg.servingRange,
    price: pkg.price,
  });

  return {
    id: pkg.id,
    slug: pkg.slug,
    name: pkg.name,
    category,
    categorySlug: slugify(category),
    price: pkg.price,
    shortDescription: pkg.shortDescription,
    description: pkg.shortDescription,
    servingSize: pkg.servingRange,
    availability: "Available",
    image: pkg.image,
    featured: true,
    tags: [productType === "tray" ? "Party Ready" : "Bulk Service"],
    productType,
    variants: [defaultVariant],
    defaultVariant,
    availableForOrder: true,
    comparePrice: null,
    currencyCode: "NGN",
    status: "published",
    availabilityStatus: "available",
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
    productsCount: fallbackProducts.filter((product) => product.category === category).length,
  })),
  {
    id: "trays",
    name: "Trays",
    slug: "trays",
    description: fallbackCategoryDescriptionMap.trays,
    imageUrl: mockTrayPackages.find((pkg) => pkg.type === "Tray")?.image ?? "",
    productsCount: 1,
  },
  {
    id: "coolers",
    name: "Coolers",
    slug: "coolers",
    description: fallbackCategoryDescriptionMap.coolers,
    imageUrl: mockTrayPackages.find((pkg) => pkg.type === "Cooler")?.image ?? "",
    productsCount: 1,
  },
];

export const fallbackTrayPackages: TrayPackage[] = mockTrayPackages.map(toTrayPackageFromMock);

export const fallbackSiteMeta: SiteMeta = {
  name: mockSiteMeta.name,
  phone: mockSiteMeta.phone,
  email: mockSiteMeta.email,
  whatsappOrderNumber: digitsOnly(mockSiteMeta.phone),
  whatsappContactNumber: digitsOnly(mockSiteMeta.phone),
  address: mockSiteMeta.address,
  hours: mockSiteMeta.hours,
  currencyCode: "NGN",
  currencySymbol: "NGN",
  deliveryInformation: "Pickup and delivery support available for direct orders, trays, and catering.",
  checkoutNotice:
    "You will continue to WhatsApp to confirm availability, delivery details and final pricing with our team.",
  socialLinks: {
    ...defaultSocialLinks,
    whatsapp: `https://wa.me/${digitsOnly(mockSiteMeta.phone)}`,
  },
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
  referenceNumber: request.id,
  email: "",
  phone: "",
  preferredService: null,
  location: null,
  requirements: null,
  notes: null,
  internalNotes: null,
  statusValue:
    request.status === "New"
      ? "new"
      : request.status === "Quoted"
        ? "quoted"
        : request.status === "Confirmed"
          ? "confirmed"
          : "completed",
  createdAt: request.eventDate,
}));

function toCategory(apiCategory: ApiCategory): Category {
  return {
    id: String(apiCategory.id),
    name: apiCategory.name,
    slug: apiCategory.slug,
    description:
      apiCategory.description ??
      fallbackCategoryDescriptionMap[apiCategory.slug] ??
      `Explore ${apiCategory.name.toLowerCase()} from the VISEMFOOD kitchen.`,
    imageUrl: apiCategory.image_url ?? "",
    productsCount: apiCategory.products_count ?? 0,
  };
}

function toVariant(apiVariant: ApiProductVariant): ProductVariant {
  return {
    id: apiVariant.id,
    name: apiVariant.name,
    slug: apiVariant.slug,
    portionLabel: apiVariant.portion_label,
    description: apiVariant.description,
    price: apiVariant.price,
    comparePrice: apiVariant.compare_price,
    currencyCode: apiVariant.currency_code,
    availabilityStatus: apiVariant.availability_status,
    isDefault: apiVariant.is_default,
    sortOrder: apiVariant.sort_order,
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
  const defaultVariant =
    (apiProduct.default_variant ? toVariant(apiProduct.default_variant) : null) ??
    variants.find((variant) => variant.isDefault) ??
    buildDefaultVariant({
      id: apiProduct.id,
      name: apiProduct.name,
      servingSize: apiProduct.serving_size ?? fallback?.servingSize ?? "Standard",
      price: apiProduct.base_price,
      currencyCode: apiProduct.currency_code,
      availabilityStatus: apiProduct.availability_status,
    });
  const categoryName = apiProduct.category?.name ?? fallback?.category ?? titleCase(apiProduct.product_type);

  return {
    id: String(apiProduct.id),
    slug: apiProduct.slug,
    name: apiProduct.name,
    category: categoryName,
    categorySlug: apiProduct.category?.slug ?? fallback?.categorySlug ?? slugify(categoryName),
    price: defaultVariant.price,
    shortDescription: apiProduct.short_description ?? fallback?.shortDescription ?? "",
    description: apiProduct.description ?? fallback?.description ?? apiProduct.short_description ?? "",
    servingSize: defaultVariant.portionLabel ?? apiProduct.serving_size ?? fallback?.servingSize ?? "Standard",
    availability: formatAvailabilityLabel(apiProduct.availability_status, apiProduct.available_for_order),
    image:
      apiProduct.primary_image_url ??
      apiProduct.primary_image?.url ??
      fallback?.image ??
      apiProduct.category?.image_url ??
      "",
    featured: apiProduct.featured,
    tags: deriveProductTags(apiProduct, fallback),
    productType: apiProduct.product_type,
    variants: variants.length > 0 ? variants : [defaultVariant],
    defaultVariant,
    availableForOrder: apiProduct.available_for_order,
    comparePrice: apiProduct.compare_price,
    currencyCode: apiProduct.currency_code,
    status: apiProduct.status,
    availabilityStatus: apiProduct.availability_status,
  };
}

function toTrayPackage(product: Product): TrayPackage {
  const fallbackPackage = fallbackTrayPackages.find((pkg) => pkg.slug === product.slug);
  const type = product.productType === "cooler" ? "Cooler" : "Tray";

  return {
    id: product.id,
    slug: product.slug,
    name: product.name,
    type,
    price: product.price,
    servingRange: product.servingSize,
    shortDescription: product.shortDescription,
    notes:
      fallbackPackage?.notes ??
      (type === "Tray"
        ? ["24-hour notice", "Pickup or dispatch available", "Custom protein add-ons"]
        : ["Ideal for mobile service", "Cutlery and drinks optional", "Advance scheduling recommended"]),
    image: product.image,
    availability: product.availability,
    productType: product.productType,
  };
}

function toSiteMeta(settings: ApiSiteSettings): SiteMeta {
  const whatsappOrderNumber =
    digitsOnly(settings.whatsapp_order_number) ||
    digitsOnly(settings.support_phone) ||
    fallbackSiteMeta.whatsappOrderNumber;
  const whatsappContactNumber =
    digitsOnly(settings.whatsapp_contact_number) ||
    whatsappOrderNumber ||
    fallbackSiteMeta.whatsappContactNumber;

  return {
    name: settings.business_name || fallbackSiteMeta.name,
    phone: settings.support_phone || fallbackSiteMeta.phone,
    email: settings.support_email || fallbackSiteMeta.email,
    whatsappOrderNumber,
    whatsappContactNumber,
    address: settings.business_address || fallbackSiteMeta.address,
    hours: settings.business_hours || fallbackSiteMeta.hours,
    currencyCode: settings.currency_code || fallbackSiteMeta.currencyCode,
    currencySymbol: settings.currency_symbol || fallbackSiteMeta.currencySymbol,
    deliveryInformation: settings.delivery_information || fallbackSiteMeta.deliveryInformation,
    checkoutNotice: settings.checkout_notice || fallbackSiteMeta.checkoutNotice,
    socialLinks: {
      ...defaultSocialLinks,
      ...(settings.social_links ?? {}),
      whatsapp: `https://wa.me/${whatsappContactNumber}`,
    },
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

function toAdminCateringInquiry(inquiry: ApiCateringInquiry): AdminCateringInquiry {
  return {
    id: inquiry.reference_number,
    referenceNumber: inquiry.reference_number,
    client: inquiry.customer_name,
    eventType: inquiry.event_type,
    eventDate: inquiry.event_date?.slice(0, 10) ?? "",
    guests: inquiry.number_of_guests ?? 0,
    status: titleCase(inquiry.status),
    budget: inquiry.budget ?? "Budget on request",
    email: inquiry.email,
    phone: inquiry.phone,
    preferredService: inquiry.preferred_service,
    location: inquiry.location,
    requirements: inquiry.requirements,
    notes: inquiry.notes,
    internalNotes: inquiry.internal_notes,
    statusValue: inquiry.status,
    createdAt: inquiry.created_at,
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

function buildQuery(params: Record<string, string | number | boolean | null | undefined>) {
  const search = new URLSearchParams();

  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null || value === "") {
      return;
    }

    search.set(key, String(value));
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
  productType?: string;
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
  customer_name: string;
  email: string;
  phone: string;
  event_type: string;
  event_date?: string | null;
  number_of_guests?: number | null;
  preferred_service?: string | null;
  location?: string | null;
  budget?: string | null;
  requirements?: string | null;
  notes?: string | null;
}) {
  const { data, message } = await apiRequest<ApiCateringInquiry>("/api/v1/catering", {
    method: "POST",
    body: payload,
  });

  return {
    message,
    data: toAdminCateringInquiry(data),
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

export async function fetchAdminProducts(params: {
  categoryId?: string;
  search?: string;
  status?: string;
  availabilityStatus?: string;
  featured?: boolean;
  productType?: string;
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
  search?: string;
  perPage?: number;
} = {}) {
  const query = buildQuery({
    status: params.status,
    search: params.search,
    per_page: params.perPage ?? 100,
  });
  const { data, meta } = await apiRequest<ApiCateringInquiry[]>(`/api/v1/admin/catering-inquiries${query}`);

  return {
    items: data.map(toAdminCateringInquiry),
    pagination: getPagination(meta),
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
