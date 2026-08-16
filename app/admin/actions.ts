"use server";

import { Decimal } from "@prisma/client/runtime/library";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { getCloudinaryClient } from "@/lib/cloudinary";
import { requireAdminSession, requireRole, loginAdmin, logoutAdmin } from "@/lib/auth";
import { encryptText } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const optional = (value: FormDataEntryValue | null) => {
  const text = `${value ?? ""}`.trim();
  return text ? text : null;
};

const booleanFrom = (value: FormDataEntryValue | null) => value === "on";

export async function loginAction(formData: FormData) {
  const email = `${formData.get("email") ?? ""}`.trim();
  const password = `${formData.get("password") ?? ""}`;
  const result = await loginAdmin(email, password);
  if (!result.ok) {
    redirect("/admin/login?error=1");
  }
  redirect("/admin");
}

export async function logoutAction() {
  await logoutAdmin();
  redirect("/admin/login");
}

export async function saveCategoryAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const id = optional(formData.get("id"));

  await prisma.productCategory.upsert({
    where: { id: id ?? "missing" },
    update: {
      name: `${formData.get("name")}`,
      slug: `${formData.get("slug")}`,
      description: optional(formData.get("description")),
      imageId: optional(formData.get("imageId")),
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: booleanFrom(formData.get("isActive"))
    },
    create: {
      name: `${formData.get("name")}`,
      slug: `${formData.get("slug")}`,
      description: optional(formData.get("description")),
      imageId: optional(formData.get("imageId")),
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: booleanFrom(formData.get("isActive"))
    }
  });

  revalidatePath("/admin/categories");
  revalidatePath("/order-now");
}

export async function saveProductAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const id = optional(formData.get("id"));
  const imageId = optional(formData.get("imageId"));
  const productData = {
    categoryId: `${formData.get("categoryId")}`,
    name: `${formData.get("name")}`,
    slug: `${formData.get("slug")}`,
    shortDescription: `${formData.get("shortDescription")}`,
    description: `${formData.get("description")}`,
    price: new Decimal(`${formData.get("price") || "0"}`),
    currency: `${formData.get("currency") || "NGN"}`,
    servingSize: optional(formData.get("servingSize")),
    availabilityStatus: `${formData.get("availabilityStatus")}` as never,
    isFeatured: booleanFrom(formData.get("isFeatured")),
    isActive: booleanFrom(formData.get("isActive")),
    whatsappMessageTemplate: optional(formData.get("whatsappMessageTemplate")),
    sortOrder: Number(formData.get("sortOrder") || 0)
  };

  const saved = id
    ? await prisma.product.update({
        where: { id },
        data: productData
      })
    : await prisma.product.create({
        data: productData
      });

  if (imageId) {
    await prisma.productImage.deleteMany({ where: { productId: saved.id } });
    await prisma.productImage.create({
      data: {
        productId: saved.id,
        mediaAssetId: imageId,
        isPrimary: true
      }
    });
  }

  revalidatePath("/admin/products");
  revalidatePath("/order-now");
  revalidatePath(`/products/${saved.slug}`);
}

export async function saveTrayPackageAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const id = optional(formData.get("id"));
  const imageId = optional(formData.get("imageId"));
  const trayData = {
    name: `${formData.get("name")}`,
    slug: `${formData.get("slug")}`,
    shortDescription: `${formData.get("shortDescription")}`,
    description: `${formData.get("description")}`,
    price: new Decimal(`${formData.get("price") || "0"}`),
    currency: `${formData.get("currency") || "NGN"}`,
    servingRange: `${formData.get("servingRange")}`,
    packageType: `${formData.get("packageType")}`,
    whatsappMessageTemplate: optional(formData.get("whatsappMessageTemplate")),
    isFeatured: booleanFrom(formData.get("isFeatured")),
    isActive: booleanFrom(formData.get("isActive")),
    sortOrder: Number(formData.get("sortOrder") || 0)
  };

  const saved = id
    ? await prisma.trayPackage.update({ where: { id }, data: trayData })
    : await prisma.trayPackage.create({ data: trayData });

  if (imageId) {
    await prisma.trayPackageImage.deleteMany({ where: { trayPackageId: saved.id } });
    await prisma.trayPackageImage.create({
      data: { trayPackageId: saved.id, mediaAssetId: imageId, isPrimary: true }
    });
  }

  revalidatePath("/admin/trays-coolers");
  revalidatePath("/trays-coolers");
}

export async function saveInquiryStatusAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "OPERATIONS_STAFF"]);
  const type = `${formData.get("type")}`;
  const id = `${formData.get("id")}`;
  const status = `${formData.get("status")}`;
  const internalNotes = optional(formData.get("internalNotes"));

  if (type === "catering") {
    await prisma.cateringInquiry.update({ where: { id }, data: { status: status as never, internalNotes } });
    revalidatePath("/admin/catering-inquiries");
  }

  if (type === "contact") {
    await prisma.contactInquiry.update({ where: { id }, data: { status: status as never, internalNotes } });
    revalidatePath("/admin/contact-inquiries");
  }

  if (type === "bulk") {
    await prisma.bulkOrderInquiry.update({ where: { id }, data: { status: status as never, internalNotes } });
    revalidatePath("/admin");
  }
}

export async function saveHomepageSectionAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const id = optional(formData.get("id"));

  await prisma.homepageSection.upsert({
    where: { id: id ?? "missing" },
    update: {
      sectionKey: `${formData.get("sectionKey")}`,
      title: `${formData.get("title")}`,
      subtitle: optional(formData.get("subtitle")),
      body: optional(formData.get("body")),
      buttonText: optional(formData.get("buttonText")),
      buttonLink: optional(formData.get("buttonLink")),
      mediaAssetId: optional(formData.get("mediaAssetId")),
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: booleanFrom(formData.get("isActive"))
    },
    create: {
      sectionKey: `${formData.get("sectionKey")}`,
      title: `${formData.get("title")}`,
      subtitle: optional(formData.get("subtitle")),
      body: optional(formData.get("body")),
      buttonText: optional(formData.get("buttonText")),
      buttonLink: optional(formData.get("buttonLink")),
      mediaAssetId: optional(formData.get("mediaAssetId")),
      sortOrder: Number(formData.get("sortOrder") || 0),
      isActive: booleanFrom(formData.get("isActive"))
    }
  });

  revalidatePath("/");
  revalidatePath("/admin/content");
}

export async function saveWebsitePageAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  const id = optional(formData.get("id"));

  await prisma.websitePage.upsert({
    where: { id: id ?? "missing" },
    update: {
      title: `${formData.get("title")}`,
      slug: `${formData.get("slug")}`,
      pageType: `${formData.get("pageType")}`,
      heroTitle: optional(formData.get("heroTitle")),
      heroSubtitle: optional(formData.get("heroSubtitle")),
      bodyContent: optional(formData.get("bodyContent")),
      metaTitle: optional(formData.get("metaTitle")),
      metaDescription: optional(formData.get("metaDescription")),
      isPublished: booleanFrom(formData.get("isPublished"))
    },
    create: {
      title: `${formData.get("title")}`,
      slug: `${formData.get("slug")}`,
      pageType: `${formData.get("pageType")}`,
      heroTitle: optional(formData.get("heroTitle")),
      heroSubtitle: optional(formData.get("heroSubtitle")),
      bodyContent: optional(formData.get("bodyContent")),
      metaTitle: optional(formData.get("metaTitle")),
      metaDescription: optional(formData.get("metaDescription")),
      isPublished: booleanFrom(formData.get("isPublished"))
    }
  });

  revalidatePath("/admin/content");
  revalidatePath("/catering");
  revalidatePath("/contact");
  revalidatePath("/our-story");
}

export async function saveMediaSettingsAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);

  await prisma.mediaSetting.upsert({
    where: { provider: "cloudinary" },
    update: {
      cloudName: `${formData.get("cloudName")}`,
      apiKey: `${formData.get("apiKey")}`,
      apiSecretEncrypted: encryptText(`${formData.get("apiSecret")}`),
      uploadPreset: optional(formData.get("uploadPreset")),
      defaultFolder: optional(formData.get("defaultFolder")),
      secureUrls: booleanFrom(formData.get("secureUrls")),
      isEnabled: booleanFrom(formData.get("isEnabled"))
    },
    create: {
      provider: "cloudinary",
      cloudName: `${formData.get("cloudName")}`,
      apiKey: `${formData.get("apiKey")}`,
      apiSecretEncrypted: encryptText(`${formData.get("apiSecret")}`),
      uploadPreset: optional(formData.get("uploadPreset")),
      defaultFolder: optional(formData.get("defaultFolder")),
      secureUrls: booleanFrom(formData.get("secureUrls")),
      isEnabled: booleanFrom(formData.get("isEnabled"))
    }
  });

  revalidatePath("/admin/media-settings");
}

export async function testCloudinaryConnectionAction() {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);
  try {
    const cloudinary = await getCloudinaryClient();
    await cloudinary.api.ping();
    redirect("/admin/media-settings?status=success");
  } catch {
    redirect("/admin/media-settings?status=error");
  }
}

export async function saveWhatsAppSettingsAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "CONTENT_MANAGER"]);

  await prisma.whatsAppSetting.upsert({
    where: { singletonKey: "default" },
    update: {
      adminPhoneNumber: `${formData.get("adminPhoneNumber")}`,
      defaultOrderMessage: `${formData.get("defaultOrderMessage")}`,
      defaultTrayMessage: `${formData.get("defaultTrayMessage")}`,
      defaultCateringMessage: `${formData.get("defaultCateringMessage")}`,
      isEnabled: booleanFrom(formData.get("isEnabled"))
    },
    create: {
      singletonKey: "default",
      adminPhoneNumber: `${formData.get("adminPhoneNumber")}`,
      defaultOrderMessage: `${formData.get("defaultOrderMessage")}`,
      defaultTrayMessage: `${formData.get("defaultTrayMessage")}`,
      defaultCateringMessage: `${formData.get("defaultCateringMessage")}`,
      isEnabled: booleanFrom(formData.get("isEnabled"))
    }
  });

  revalidatePath("/admin/whatsapp-settings");
  revalidatePath("/");
  revalidatePath("/order-now");
  revalidatePath("/trays-coolers");
}

export async function saveSiteSettingsAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "OPERATIONS_STAFF"]);

  await prisma.siteSetting.upsert({
    where: { singletonKey: "default" },
    update: {
      siteName: `${formData.get("siteName")}`,
      supportEmail: optional(formData.get("supportEmail")),
      supportPhone: optional(formData.get("supportPhone")),
      whatsappNumber: optional(formData.get("whatsappNumber")),
      businessAddress: optional(formData.get("businessAddress")),
      businessHours: optional(formData.get("businessHours")),
      facebookUrl: optional(formData.get("facebookUrl")),
      instagramUrl: optional(formData.get("instagramUrl")),
      tiktokUrl: optional(formData.get("tiktokUrl")),
      logoMediaAssetId: optional(formData.get("logoMediaAssetId")),
      faviconMediaAssetId: optional(formData.get("faviconMediaAssetId"))
    },
    create: {
      singletonKey: "default",
      siteName: `${formData.get("siteName")}`,
      supportEmail: optional(formData.get("supportEmail")),
      supportPhone: optional(formData.get("supportPhone")),
      whatsappNumber: optional(formData.get("whatsappNumber")),
      businessAddress: optional(formData.get("businessAddress")),
      businessHours: optional(formData.get("businessHours")),
      facebookUrl: optional(formData.get("facebookUrl")),
      instagramUrl: optional(formData.get("instagramUrl")),
      tiktokUrl: optional(formData.get("tiktokUrl")),
      logoMediaAssetId: optional(formData.get("logoMediaAssetId")),
      faviconMediaAssetId: optional(formData.get("faviconMediaAssetId"))
    }
  });

  revalidatePath("/admin/site-settings");
  revalidatePath("/");
  revalidatePath("/contact");
}

export async function saveOrderAction(formData: FormData) {
  await requireRole(["SUPER_ADMIN", "OPERATIONS_STAFF"]);
  const id = optional(formData.get("id"));
  const baseData = {
    customerName: `${formData.get("customerName")}`,
    customerPhone: `${formData.get("customerPhone")}`,
    customerEmail: optional(formData.get("customerEmail")),
    orderType: `${formData.get("orderType")}` as never,
    source: `${formData.get("source")}` as never,
    status: `${formData.get("status")}` as never,
    totalAmount: optional(formData.get("totalAmount")) ? new Decimal(`${formData.get("totalAmount")}`) : null,
    pickupOrDelivery: optional(formData.get("pickupOrDelivery")),
    deliveryAddress: optional(formData.get("deliveryAddress")),
    orderNotes: optional(formData.get("orderNotes"))
  };

  await prisma.order.upsert({
    where: { id: id ?? "missing" },
    update: baseData,
    create: {
      orderReference: `VF-${Date.now()}`,
      ...baseData
    }
  });

  revalidatePath("/admin/orders");
  revalidatePath("/admin");
}
