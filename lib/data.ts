import { Decimal } from "@prisma/client/runtime/library";
import { prisma } from "@/lib/prisma";
import {
  fallbackCategories,
  fallbackHomepageSections,
  fallbackPages,
  fallbackProducts,
  fallbackSiteSettings,
  fallbackTrayPackages,
  fallbackWhatsApp
} from "@/lib/fallback-data";

function toNumber(value: Decimal | number | null | undefined) {
  if (value == null) return null;
  return typeof value === "number" ? value : Number(value);
}

export async function getSiteSettings() {
  try {
    return (
      (await prisma.siteSetting.findUnique({ where: { singletonKey: "default" } })) ??
      fallbackSiteSettings
    );
  } catch {
    return fallbackSiteSettings;
  }
}

export async function getWhatsAppSettings() {
  try {
    return (
      (await prisma.whatsAppSetting.findUnique({ where: { singletonKey: "default" } })) ??
      fallbackWhatsApp
    );
  } catch {
    return fallbackWhatsApp;
  }
}

export async function getHomepageSections() {
  try {
    const sections = await prisma.homepageSection.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    });
    return sections.length ? sections : fallbackHomepageSections;
  } catch {
    return fallbackHomepageSections;
  }
}

export async function getCategories() {
  try {
    const categories = await prisma.productCategory.findMany({
      where: { isActive: true },
      orderBy: { sortOrder: "asc" }
    });
    return categories.length ? categories : fallbackCategories;
  } catch {
    return fallbackCategories;
  }
}

export async function getProducts(search?: string, categorySlug?: string) {
  try {
    const products = await prisma.product.findMany({
      where: {
        isActive: true,
        ...(search
          ? {
              OR: [
                { name: { contains: search } },
                { shortDescription: { contains: search } }
              ]
            }
          : {}),
        ...(categorySlug ? { category: { slug: categorySlug } } : {})
      },
      include: {
        category: true,
        images: {
          include: { mediaAsset: true },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }]
        }
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }]
    });

    if (!products.length) return fallbackProducts;

    return products.map((product: (typeof products)[number]) => ({
      ...product,
      price: toNumber(product.price) ?? 0,
      image: product.images[0]?.mediaAsset
        ? {
            publicId: product.images[0].mediaAsset.publicId,
            secureUrl: product.images[0].mediaAsset.secureUrl
          }
        : null,
      categoryName: product.category.name
    }));
  } catch {
    return fallbackProducts;
  }
}

export async function getFeaturedProducts() {
  const products = await getProducts();
  return products.filter((product: (typeof products)[number]) => product.isFeatured).slice(0, 3);
}

export async function getProductBySlug(slug: string) {
  try {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: {
        category: true,
        images: {
          include: { mediaAsset: true },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }]
        }
      }
    });
    if (!product || !product.isActive) return null;
    return {
      ...product,
      price: toNumber(product.price) ?? 0,
      images: product.images.map((image: (typeof product.images)[number]) => image.mediaAsset),
      categoryName: product.category.name
    };
  } catch {
    return fallbackProducts.find((product: (typeof fallbackProducts)[number]) => product.slug === slug) ?? null;
  }
}

export async function getTrayPackages() {
  try {
    const packages = await prisma.trayPackage.findMany({
      where: { isActive: true },
      include: {
        images: {
          include: { mediaAsset: true },
          orderBy: [{ isPrimary: "desc" }, { sortOrder: "asc" }]
        }
      },
      orderBy: [{ isFeatured: "desc" }, { sortOrder: "asc" }]
    });

    if (!packages.length) return fallbackTrayPackages;

    return packages.map((trayPackage: (typeof packages)[number]) => ({
      ...trayPackage,
      price: toNumber(trayPackage.price) ?? 0,
      image: trayPackage.images[0]?.mediaAsset
        ? {
            publicId: trayPackage.images[0].mediaAsset.publicId,
            secureUrl: trayPackage.images[0].mediaAsset.secureUrl
          }
        : null
    }));
  } catch {
    return fallbackTrayPackages;
  }
}

export async function getPageContent(pageType: keyof typeof fallbackPages) {
  try {
    const page = await prisma.websitePage.findUnique({
      where: { pageType },
      include: {
        blocks: {
          where: { isActive: true },
          orderBy: { sortOrder: "asc" }
        }
      }
    });

    return page ?? fallbackPages[pageType];
  } catch {
    return fallbackPages[pageType];
  }
}
