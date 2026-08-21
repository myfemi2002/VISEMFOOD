import { AvailabilityStatus, UserRoleSlug } from "@prisma/client";
import { createPasswordHash, encryptText } from "../seed-utils";
import { prisma } from "../lib/prisma";

const mediaAssets = [
  {
    key: "hero",
    publicId: "visemfood/hero-jollof",
    secureUrl:
      "https://images.unsplash.com/photo-1517244683847-7456b63c5969?auto=format&fit=crop&w=1600&q=80",
    altText: "Premium plated African cuisine",
    width: 1600,
    height: 1067
  },
  {
    key: "jollof",
    publicId: "visemfood/signature-jollof",
    secureUrl:
      "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1200&q=80",
    altText: "Signature jollof rice",
    width: 1200,
    height: 800
  },
  {
    key: "egusi",
    publicId: "visemfood/egusi-soup",
    secureUrl:
      "https://images.unsplash.com/photo-1504674900247-0877df9cc836?auto=format&fit=crop&w=1200&q=80",
    altText: "Egusi soup bowl",
    width: 1200,
    height: 800
  },
  {
    key: "small-chops",
    publicId: "visemfood/small-chops",
    secureUrl:
      "https://images.unsplash.com/photo-1515003197210-e0cd71810b5f?auto=format&fit=crop&w=1200&q=80",
    altText: "Small chops platter",
    width: 1200,
    height: 800
  },
  {
    key: "tray",
    publicId: "visemfood/party-tray",
    secureUrl:
      "https://images.unsplash.com/photo-1529042410759-befb1204b468?auto=format&fit=crop&w=1400&q=80",
    altText: "Party food tray",
    width: 1400,
    height: 933
  }
];

async function main() {
  const roles = [
    { slug: UserRoleSlug.SUPER_ADMIN, name: "Super Admin", description: "Full access" },
    { slug: UserRoleSlug.CONTENT_MANAGER, name: "Content Manager", description: "Content and products" },
    { slug: UserRoleSlug.OPERATIONS_STAFF, name: "Operations Staff", description: "Inquiries and orders" }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug },
      update: role,
      create: role
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { slug: UserRoleSlug.SUPER_ADMIN }
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@visemfood.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {
      name: "VISEMFOOD Admin",
      roleId: adminRole.id
    },
    create: {
      name: "VISEMFOOD Admin",
      email: adminEmail,
      passwordHash: await createPasswordHash(adminPassword),
      roleId: adminRole.id
    }
  });

  const mediaByKey = new Map<string, { id: string }>();
  for (const asset of mediaAssets) {
    const saved = await prisma.mediaAsset.upsert({
      where: { publicId: asset.publicId },
      update: {
        secureUrl: asset.secureUrl,
        altText: asset.altText,
        width: asset.width,
        height: asset.height,
        provider: "cloudinary",
        resourceType: "image",
        format: "jpg",
        folder: "visemfood/seed"
      },
      create: {
        provider: "cloudinary",
        publicId: asset.publicId,
        secureUrl: asset.secureUrl,
        resourceType: "image",
        format: "jpg",
        width: asset.width,
        height: asset.height,
        folder: "visemfood/seed",
        altText: asset.altText
      }
    });

    mediaByKey.set(asset.key, { id: saved.id });
  }

  const riceCategory = await prisma.productCategory.upsert({
    where: { slug: "rice-dishes" },
    update: {
      name: "Rice Dishes",
      description: "Celebration-ready rice dishes with premium presentation.",
      sortOrder: 1,
      isActive: true
    },
    create: {
      name: "Rice Dishes",
      slug: "rice-dishes",
      description: "Celebration-ready rice dishes with premium presentation.",
      sortOrder: 1,
      isActive: true
    }
  });

  const soupsCategory = await prisma.productCategory.upsert({
    where: { slug: "soups" },
    update: {
      name: "Soups",
      description: "Rich, rooted soups for comforting premium dining.",
      sortOrder: 2,
      isActive: true
    },
    create: {
      name: "Soups",
      slug: "soups",
      description: "Rich, rooted soups for comforting premium dining.",
      sortOrder: 2,
      isActive: true
    }
  });

  const chopsCategory = await prisma.productCategory.upsert({
    where: { slug: "small-chops" },
    update: {
      name: "Small Chops",
      description: "Finger foods and event-friendly bites.",
      sortOrder: 3,
      isActive: true
    },
    create: {
      name: "Small Chops",
      slug: "small-chops",
      description: "Finger foods and event-friendly bites.",
      sortOrder: 3,
      isActive: true
    }
  });

  const products = [
    {
      slug: "signature-jollof-rice",
      categoryId: riceCategory.id,
      name: "Signature Jollof Rice",
      shortDescription: "Slow-cooked premium jollof layered with deep pepper richness.",
      description:
        "A premium VISEMFOOD signature with bold tomato depth, tender protein pairing, and a celebration-ready finish.",
      price: "8500",
      servingSize: "Single Bowl",
      availabilityStatus: AvailabilityStatus.IN_STOCK,
      isFeatured: true,
      sortOrder: 1,
      mediaKey: "jollof"
    },
    {
      slug: "egusi-soup-bowl",
      categoryId: soupsCategory.id,
      name: "Egusi Soup Bowl",
      shortDescription: "Rich egusi with premium proteins and warm swallow pairing.",
      description:
        "Velvety melon seed soup balanced with stock depth, leafy freshness, and slow-cooked proteins.",
      price: "11000",
      servingSize: "Shared Bowl",
      availabilityStatus: AvailabilityStatus.LIMITED,
      isFeatured: true,
      sortOrder: 2,
      mediaKey: "egusi"
    },
    {
      slug: "cocktail-small-chops-box",
      categoryId: chopsCategory.id,
      name: "Cocktail Small Chops Box",
      shortDescription: "Crisp, golden, event-ready bites curated for warm hosting.",
      description:
        "An assorted premium box of puff-puff, samosas, spring rolls, and savory bites for parties and executive sharing.",
      price: "14500",
      servingSize: "Box for 4 - 6 guests",
      availabilityStatus: AvailabilityStatus.IN_STOCK,
      isFeatured: false,
      sortOrder: 3,
      mediaKey: "small-chops"
    }
  ];

  for (const item of products) {
    const product = await prisma.product.upsert({
      where: { slug: item.slug },
      update: {
        categoryId: item.categoryId,
        name: item.name,
        shortDescription: item.shortDescription,
        description: item.description,
        price: item.price,
        servingSize: item.servingSize,
        availabilityStatus: item.availabilityStatus,
        isFeatured: item.isFeatured,
        isActive: true,
        currency: "NGN",
        sortOrder: item.sortOrder
      },
      create: {
        categoryId: item.categoryId,
        name: item.name,
        slug: item.slug,
        shortDescription: item.shortDescription,
        description: item.description,
        price: item.price,
        servingSize: item.servingSize,
        availabilityStatus: item.availabilityStatus,
        isFeatured: item.isFeatured,
        isActive: true,
        currency: "NGN",
        sortOrder: item.sortOrder
      }
    });

    const mediaAssetId = mediaByKey.get(item.mediaKey)?.id;
    if (mediaAssetId) {
      await prisma.productImage.deleteMany({ where: { productId: product.id } });
      await prisma.productImage.create({
        data: {
          productId: product.id,
          mediaAssetId,
          isPrimary: true,
          sortOrder: 1
        }
      });
    }
  }

  const trayPackage = await prisma.trayPackage.upsert({
    where: { slug: "large-jollof-party-tray" },
    update: {
      name: "Large Jollof Party Tray",
      shortDescription: "A celebration-sized tray built for family events and corporate gatherings.",
      description:
        "Designed for hosting with confidence, this tray serves generous portions with the VISEMFOOD premium finish.",
      price: "85000",
      servingRange: "Serves 12 - 18",
      packageType: "Tray",
      isFeatured: true,
      isActive: true,
      currency: "NGN",
      sortOrder: 1
    },
    create: {
      name: "Large Jollof Party Tray",
      slug: "large-jollof-party-tray",
      shortDescription: "A celebration-sized tray built for family events and corporate gatherings.",
      description:
        "Designed for hosting with confidence, this tray serves generous portions with the VISEMFOOD premium finish.",
      price: "85000",
      servingRange: "Serves 12 - 18",
      packageType: "Tray",
      isFeatured: true,
      isActive: true,
      currency: "NGN",
      sortOrder: 1
    }
  });

  const trayMediaId = mediaByKey.get("tray")?.id;
  if (trayMediaId) {
    await prisma.trayPackageImage.deleteMany({ where: { trayPackageId: trayPackage.id } });
    await prisma.trayPackageImage.create({
      data: {
        trayPackageId: trayPackage.id,
        mediaAssetId: trayMediaId,
        isPrimary: true,
        sortOrder: 1
      }
    });
  }

  const homepageSections = [
    {
      sectionKey: "hero",
      title: "Premium African Food, Crafted for Everyday Pleasure and Grand Occasions.",
      subtitle: "A dynamic culinary platform for modern hospitality, bulk orders, and elegant catering.",
      body: "Browse meals, request event service, and connect directly with VISEMFOOD through a guided ordering flow.",
      buttonText: "Order Now",
      buttonLink: "/order-now",
      mediaAssetId: mediaByKey.get("hero")?.id ?? null,
      sortOrder: 1
    },
    {
      sectionKey: "featured_meals",
      title: "Signature Meals",
      subtitle: "The dishes our customers return for.",
      body: "Built with bold flavor, polished presentation, and premium hospitality.",
      buttonText: "Browse Menu",
      buttonLink: "/order-now",
      mediaAssetId: mediaByKey.get("jollof")?.id ?? null,
      sortOrder: 2
    },
    {
      sectionKey: "trays_highlight",
      title: "Trays & Coolers for Gatherings",
      subtitle: "Scaled for celebrations, offices, and family tables.",
      body: "Bulk ordering made clear, beautiful, and WhatsApp-friendly.",
      buttonText: "View Trays & Coolers",
      buttonLink: "/trays-coolers",
      mediaAssetId: mediaByKey.get("tray")?.id ?? null,
      sortOrder: 3
    },
    {
      sectionKey: "story_preview",
      title: "Our Story",
      subtitle: "Rooted in culture, plated with intention.",
      body: "VISEMFOOD brings premium African hospitality into a modern digital experience.",
      buttonText: "Read Our Story",
      buttonLink: "/our-story",
      mediaAssetId: mediaByKey.get("hero")?.id ?? null,
      sortOrder: 4
    }
  ];

  for (const section of homepageSections) {
    await prisma.homepageSection.upsert({
      where: { sectionKey: section.sectionKey },
      update: section,
      create: section
    });
  }

  const websitePages = [
    {
      title: "Catering",
      slug: "catering",
      pageType: "catering",
      heroTitle: "Premium Catering for Celebrations, Corporate Events, and Private Hospitality.",
      heroSubtitle:
        "VISEMFOOD delivers warm service, strong presentation, and authentic African culinary excellence.",
      bodyContent:
        "Our catering offer is built for hosts who want confidence, quality, and a memorable table experience.",
      metaTitle: "VISEMFOOD Catering",
      metaDescription: "Premium catering for celebrations, family events, and executive hospitality."
    },
    {
      title: "Contact Us",
      slug: "contact",
      pageType: "contact",
      heroTitle: "Let's Help You Plan Your Next Order or Event.",
      heroSubtitle: "Reach out for general support, catering, or trays and coolers coordination.",
      bodyContent: "We respond with hospitality, clarity, and speed.",
      metaTitle: "Contact VISEMFOOD",
      metaDescription: "Get in touch with VISEMFOOD for support, catering, and event planning."
    },
    {
      title: "Our Story",
      slug: "our-story",
      pageType: "ourStory",
      heroTitle: "A Brand Built on Hospitality, Heritage, and Memorable Flavor.",
      heroSubtitle: "VISEMFOOD blends premium food presentation with warm cultural authenticity.",
      bodyContent:
        "From everyday meals to event-scale hospitality, our goal is to make every table feel intentional.",
      metaTitle: "Our Story | VISEMFOOD",
      metaDescription: "Learn the VISEMFOOD story and the hospitality values behind the brand."
    }
  ];

  for (const page of websitePages) {
    await prisma.websitePage.upsert({
      where: { pageType: page.pageType },
      update: {
        ...page,
        isPublished: true
      },
      create: {
        ...page,
        isPublished: true
      }
    });
  }

  await prisma.whatsAppSetting.upsert({
    where: { singletonKey: "default" },
    update: {
      adminPhoneNumber: "+2348000000000",
      defaultOrderMessage:
        "Hello VISEMFOOD, I want to order {{name}} for {{price}}. {{quantity_prompt}}",
      defaultTrayMessage:
        "Hello VISEMFOOD, I am interested in the {{name}} package for {{price}}. Please assist me.",
      defaultCateringMessage:
        "Hello VISEMFOOD, I would like to make a catering inquiry. Please assist me."
    },
    create: {
      singletonKey: "default",
      adminPhoneNumber: "+2348000000000",
      defaultOrderMessage:
        "Hello VISEMFOOD, I want to order {{name}} for {{price}}. {{quantity_prompt}}",
      defaultTrayMessage:
        "Hello VISEMFOOD, I am interested in the {{name}} package for {{price}}. Please assist me.",
      defaultCateringMessage:
        "Hello VISEMFOOD, I would like to make a catering inquiry. Please assist me."
    }
  });

  await prisma.siteSetting.upsert({
    where: { singletonKey: "default" },
    update: {
      siteName: "VISEMFOOD",
      supportEmail: "hello@visemfood.com",
      supportPhone: "+2348000000000",
      whatsappNumber: "+2348000000000",
      businessAddress: "Lekki, Lagos, Nigeria",
      businessHours: "Mon - Sat, 9am - 7pm"
    },
    create: {
      singletonKey: "default",
      siteName: "VISEMFOOD",
      supportEmail: "hello@visemfood.com",
      supportPhone: "+2348000000000",
      whatsappNumber: "+2348000000000",
      businessAddress: "Lekki, Lagos, Nigeria",
      businessHours: "Mon - Sat, 9am - 7pm"
    }
  });

  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    await prisma.mediaSetting.upsert({
      where: { provider: "cloudinary" },
      update: {
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: "set-in-admin",
        apiSecretEncrypted: encryptText("set-in-admin")
      },
      create: {
        provider: "cloudinary",
        cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
        apiKey: "set-in-admin",
        apiSecretEncrypted: encryptText("set-in-admin")
      }
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
