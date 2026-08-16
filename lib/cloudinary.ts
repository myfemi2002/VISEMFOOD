import { v2 as cloudinary } from "cloudinary";
import { decryptText } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

export async function getCloudinaryClient() {
  const settings = await prisma.mediaSetting.findUnique({
    where: { provider: "cloudinary" }
  });

  if (!settings || !settings.isEnabled) {
    throw new Error("Cloudinary settings are not configured.");
  }

  cloudinary.config({
    cloud_name: settings.cloudName,
    api_key: settings.apiKey,
    api_secret: decryptText(settings.apiSecretEncrypted),
    secure: settings.secureUrls
  });

  return cloudinary;
}
