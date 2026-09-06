export type Product = {
  id: string;
  slug: string;
  name: string;
  category: string;
  price: number;
  shortDescription: string;
  description: string;
  servingSize: string;
  availability: "Available" | "Limited" | "Sold Out";
  image: string;
  featured?: boolean;
  tags?: string[];
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
};

export type CateringRequest = {
  id: string;
  client: string;
  eventType: string;
  eventDate: string;
  guests: number;
  status: "New" | "Quoted" | "Confirmed" | "Closed";
  budget: string;
};

export type BulkOrder = {
  id: string;
  customer: string;
  packageName: string;
  quantity: number;
  eventDate: string;
  status: "Pending" | "Prep" | "Ready" | "Delivered";
  total: number;
};

export const siteMeta = {
  name: "VISEMFOOD",
  phone: "+234 800 000 0000",
  email: "hello@visemfood.com",
  address: "Lekki Phase 1, Lagos, Nigeria",
  hours: "Mon - Sat, 9:00am - 7:00pm",
};

export const categoryFilters = [
  "All",
  "Rice Dishes",
  "Soups",
  "Small Chops",
  "Proteins",
  "Desserts",
] as const;

export const products: Product[] = [
  {
    id: "p1",
    slug: "signature-jollof-rice",
    name: "Signature Jollof Rice",
    category: "Rice Dishes",
    price: 8500,
    shortDescription: "Slow-cooked premium jollof layered with deep pepper richness.",
    description:
      "A premium VISEMFOOD signature with bold tomato depth, tender protein pairing, and a celebration-ready finish.",
    servingSize: "Single bowl",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    featured: true,
    tags: ["Chef's Favourite", "Party Ready"],
  },
  {
    id: "p2",
    slug: "egusi-soup-bowl",
    name: "Egusi Soup Bowl",
    category: "Soups",
    price: 11000,
    shortDescription: "Velvety egusi with premium proteins and leafy depth.",
    description:
      "Comforting, deeply seasoned, and plated with warmth for elevated everyday dining or event service.",
    servingSize: "Shared bowl",
    availability: "Limited",
    image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    tags: ["Comfort Classic"],
  },
  {
    id: "p3",
    slug: "cocktail-small-chops-box",
    name: "Cocktail Small Chops Box",
    category: "Small Chops",
    price: 14500,
    shortDescription: "Golden, event-ready finger foods curated for refined hosting.",
    description:
      "An assorted premium box of puff-puff, spring rolls, samosas, and savoury bites for meetings, parties, and intimate celebrations.",
    servingSize: "Box for 4 to 6 guests",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    tags: ["Event Essential"],
  },
  {
    id: "p4",
    slug: "grilled-chicken-platter",
    name: "Grilled Chicken Platter",
    category: "Proteins",
    price: 16000,
    shortDescription: "Charred, juicy, and glazed for premium table presence.",
    description:
      "A cocoa-spice grilled chicken platter served with herb sauce and garnish for private dinners and corporate hospitality.",
    servingSize: "Platter for 2",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1525351484163-7529414344d8?auto=format&fit=crop&w=1200&q=80",
  },
  {
    id: "p5",
    slug: "caramel-plantain-cups",
    name: "Caramel Plantain Cups",
    category: "Desserts",
    price: 7000,
    shortDescription: "Soft plantain bites with caramel finish and warm spice notes.",
    description:
      "A plated dessert that bridges familiarity and polish, ideal for hospitality trays and premium menus.",
    servingSize: "Dessert cup",
    availability: "Available",
    image: "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?auto=format&fit=crop&w=1200&q=80",
  },
];

export const trayPackages: TrayPackage[] = [
  {
    id: "t1",
    slug: "large-jollof-party-tray",
    name: "Large Jollof Party Tray",
    type: "Tray",
    price: 85000,
    servingRange: "Serves 12 - 18",
    shortDescription: "A celebration-sized tray built for family events and executive gatherings.",
    notes: ["24-hour notice", "Pickup or dispatch available", "Custom protein add-ons"],
    image: "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1400&q=80",
  },
  {
    id: "t2",
    slug: "executive-cooler-pack",
    name: "Executive Cooler Pack",
    type: "Cooler",
    price: 120000,
    servingRange: "Serves 18 - 25",
    shortDescription: "Bulk cooler package designed for retreats, teams, and day-long events.",
    notes: ["Ideal for mobile service", "Cutlery and drinks optional", "Advance scheduling recommended"],
    image: "https://images.unsplash.com/photo-1514933651103-005eec06c04b?auto=format&fit=crop&w=1400&q=80",
  },
];

export const cateringRequests: CateringRequest[] = [
  {
    id: "CR-1042",
    client: "Amina Yusuf",
    eventType: "Wedding Reception",
    eventDate: "2026-09-12",
    guests: 250,
    status: "Quoted",
    budget: "$4,500 - $5,000",
  },
  {
    id: "CR-1045",
    client: "Deloitte Lagos",
    eventType: "Corporate Lunch",
    eventDate: "2026-08-29",
    guests: 80,
    status: "Confirmed",
    budget: "$1,200 - $1,500",
  },
  {
    id: "CR-1048",
    client: "Tolu Adebayo",
    eventType: "Birthday Dinner",
    eventDate: "2026-09-03",
    guests: 35,
    status: "New",
    budget: "$450 - $700",
  },
];

export const bulkOrders: BulkOrder[] = [
  {
    id: "BO-2034",
    customer: "The Oak House",
    packageName: "Large Jollof Party Tray",
    quantity: 3,
    eventDate: "2026-08-25",
    status: "Prep",
    total: 255000,
  },
  {
    id: "BO-2038",
    customer: "Bisi & Co",
    packageName: "Executive Cooler Pack",
    quantity: 2,
    eventDate: "2026-08-26",
    status: "Pending",
    total: 240000,
  },
  {
    id: "BO-2040",
    customer: "Nestoil",
    packageName: "Large Jollof Party Tray",
    quantity: 4,
    eventDate: "2026-08-27",
    status: "Delivered",
    total: 340000,
  },
];

export const analytics = {
  revenueThisMonth: 12450000,
  ordersThisWeek: 48,
  averageOrderValue: 86500,
  conversionRate: "5.8%",
  topCategories: [
    { label: "Rice Dishes", value: 42 },
    { label: "Small Chops", value: 28 },
    { label: "Soups", value: 18 },
  ],
};
