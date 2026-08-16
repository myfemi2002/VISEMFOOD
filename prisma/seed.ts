import { createPasswordHash, encryptText } from "../seed-utils";
import { prisma } from "../lib/prisma";

async function main() {
  const roles = [
    { slug: "SUPER_ADMIN", name: "Super Admin", description: "Full access" },
    { slug: "CONTENT_MANAGER", name: "Content Manager", description: "Content and products" },
    { slug: "OPERATIONS_STAFF", name: "Operations Staff", description: "Inquiries and orders" }
  ];

  for (const role of roles) {
    await prisma.role.upsert({
      where: { slug: role.slug as never },
      update: role as never,
      create: role as never
    });
  }

  const adminRole = await prisma.role.findUniqueOrThrow({
    where: { slug: "SUPER_ADMIN" as never }
  });

  const adminEmail = process.env.SEED_ADMIN_EMAIL ?? "admin@visemfood.com";
  const adminPassword = process.env.SEED_ADMIN_PASSWORD ?? "ChangeMe123!";

  await prisma.user.upsert({
    where: { email: adminEmail },
    update: {},
    create: {
      name: "VISEMFOOD Admin",
      email: adminEmail,
      passwordHash: await createPasswordHash(adminPassword),
      roleId: adminRole.id
    }
  });

  await prisma.whatsAppSetting.upsert({
    where: { singletonKey: "default" },
    update: {},
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
    update: {},
    create: {
      singletonKey: "default",
      siteName: "VISEMFOOD",
      supportEmail: "hello@visemfood.com",
      supportPhone: "+2348000000000",
      whatsappNumber: "+2348000000000",
      businessAddress: "Lagos, Nigeria",
      businessHours: "Mon - Sat, 9am - 7pm"
    }
  });

  if (process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME) {
    await prisma.mediaSetting.upsert({
      where: { provider: "cloudinary" },
      update: {},
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
