export const fallbackSiteSettings = {
  siteName: "VISEMFOOD",
  supportEmail: "hello@visemfood.com",
  supportPhone: "+234 800 000 0000",
  whatsappNumber: "+234 800 000 0000",
  businessAddress: "Lagos, Nigeria",
  businessHours: "Mon - Sat, 9am - 7pm",
  instagramUrl: "#",
  facebookUrl: "#",
  tiktokUrl: "#"
};

export const fallbackWhatsApp = {
  adminPhoneNumber: "+2348000000000",
  defaultOrderMessage:
    "Hello VISEMFOOD, I want to order {{name}} for {{price}}. {{quantity_prompt}}",
  defaultTrayMessage:
    "Hello VISEMFOOD, I am interested in the {{name}} package for {{price}}. Please assist me.",
  defaultCateringMessage:
    "Hello VISEMFOOD, I would like to make a catering inquiry. Please assist me."
};

export const fallbackCategories = [
  { id: "cat-rice", name: "Rice Dishes", slug: "rice-dishes" },
  { id: "cat-soups", name: "Soups", slug: "soups" },
  { id: "cat-small-chops", name: "Small Chops", slug: "small-chops" }
];

export const fallbackProducts = [
  {
    id: "prod-jollof",
    name: "Signature Jollof Rice",
    slug: "signature-jollof-rice",
    shortDescription: "Slow-cooked premium jollof layered with deep pepper richness.",
    description:
      "A premium VISEMFOOD signature with bold tomato depth, tender protein pairing, and a celebration-ready finish.",
    price: 8500,
    currency: "NGN",
    servingSize: "Single Bowl",
    availabilityStatus: "IN_STOCK",
    isFeatured: true,
    whatsappMessageTemplate: "",
    categoryId: "cat-rice",
    categoryName: "Rice Dishes",
    images: [
      {
        publicId: "cld-sample-5",
        secureUrl: "https://res.cloudinary.com/demo/image/upload/cld-sample-5"
      }
    ],
    image: {
      publicId: "cld-sample-5",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/cld-sample-5"
    }
  },
  {
    id: "prod-egusi",
    name: "Egusi Soup Bowl",
    slug: "egusi-soup-bowl",
    shortDescription: "Rich egusi with premium proteins and warm swallow pairing.",
    description:
      "Velvety melon seed soup balanced with stock depth, leafy freshness, and slow-cooked proteins.",
    price: 11000,
    currency: "NGN",
    servingSize: "Shared Bowl",
    availabilityStatus: "LIMITED",
    isFeatured: false,
    whatsappMessageTemplate: "",
    categoryId: "cat-soups",
    categoryName: "Soups",
    images: [
      {
        publicId: "cld-sample",
        secureUrl: "https://res.cloudinary.com/demo/image/upload/cld-sample"
      }
    ],
    image: {
      publicId: "cld-sample",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/cld-sample"
    }
  }
];

export const fallbackTrayPackages = [
  {
    id: "tray-jollof-large",
    name: "Large Jollof Party Tray",
    slug: "large-jollof-party-tray",
    shortDescription: "A celebration-sized tray built for family events and corporate gatherings.",
    description:
      "Designed for hosting with confidence, this tray serves generous portions with the VISEMFOOD premium finish.",
    price: 85000,
    currency: "NGN",
    servingRange: "Serves 12 - 18",
    packageType: "Tray",
    whatsappMessageTemplate: "",
    image: {
      publicId: "cld-sample-4",
      secureUrl: "https://res.cloudinary.com/demo/image/upload/cld-sample-4"
    }
  }
];

export const fallbackHomepageSections = [
  {
    sectionKey: "hero",
    title: "Premium African Food, Crafted for Everyday Pleasure and Grand Occasions.",
    subtitle: "A dynamic culinary platform for modern hospitality, bulk orders, and elegant catering.",
    body: "Browse meals, request event service, and connect directly with VISEMFOOD through a guided ordering flow.",
    buttonText: "Order Now",
    buttonLink: "/order-now",
    isActive: true
  },
  {
    sectionKey: "featured_meals",
    title: "Signature Meals",
    subtitle: "The dishes our customers return for.",
    body: "Built with bold flavor, polished presentation, and premium hospitality.",
    buttonText: "Browse Menu",
    buttonLink: "/order-now",
    isActive: true
  },
  {
    sectionKey: "trays_highlight",
    title: "Trays & Coolers for Gatherings",
    subtitle: "Scaled for celebrations, offices, and family tables.",
    body: "Bulk ordering made clear, beautiful, and WhatsApp-friendly.",
    buttonText: "View Trays & Coolers",
    buttonLink: "/trays-coolers",
    isActive: true
  },
  {
    sectionKey: "story_preview",
    title: "Our Story",
    subtitle: "Rooted in culture, plated with intention.",
    body: "VISEMFOOD brings premium African hospitality into a modern digital experience.",
    buttonText: "Read Our Story",
    buttonLink: "/our-story",
    isActive: true
  }
];

export const fallbackPages = {
  catering: {
    title: "Catering",
    heroTitle: "Premium Catering for Celebrations, Corporate Events, and Private Hospitality.",
    heroSubtitle:
      "VISEMFOOD delivers warm service, strong presentation, and authentic African culinary excellence.",
    bodyContent:
      "Our catering offer is built for hosts who want confidence, quality, and a memorable table experience."
  },
  contact: {
    title: "Contact Us",
    heroTitle: "Let's Help You Plan Your Next Order or Event.",
    heroSubtitle: "Reach out for general support, catering, or trays and coolers coordination.",
    bodyContent: "We respond with hospitality, clarity, and speed."
  },
  ourStory: {
    title: "Our Story",
    heroTitle: "A Brand Built on Hospitality, Heritage, and Memorable Flavor.",
    heroSubtitle: "VISEMFOOD blends premium food presentation with warm cultural authenticity.",
    bodyContent:
      "From everyday meals to event-scale hospitality, our goal is to make every table feel intentional."
  }
};
