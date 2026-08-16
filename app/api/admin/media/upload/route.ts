import { NextResponse } from "next/server";
import { decodeSession } from "@/lib/auth";
import { getCloudinaryClient } from "@/lib/cloudinary";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const cookie = request.headers.get("cookie") ?? "";
  const sessionValue = cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith("visemfood_admin_session="))
    ?.split("=")[1];

  if (!decodeSession(sessionValue)) {
    return NextResponse.redirect(new URL("/admin/login", request.url));
  }

  const formData = await request.formData();
  const file = formData.get("file");
  if (!(file instanceof File)) {
    return NextResponse.redirect(new URL("/admin/media-settings?status=error", request.url));
  }

  const cloudinary = await getCloudinaryClient();
  const arrayBuffer = await file.arrayBuffer();
  const buffer = Buffer.from(arrayBuffer);
  const folder = `${formData.get("folder") || "visemfood/uploads"}`;
  const altText = `${formData.get("altText") || ""}`;

  const uploadResult = await new Promise<any>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream({ folder }, (error, result) => {
      if (error || !result) {
        reject(error);
        return;
      }
      resolve(result);
    });
    stream.end(buffer);
  });

  await prisma.mediaAsset.create({
    data: {
      provider: "cloudinary",
      publicId: uploadResult.public_id,
      secureUrl: uploadResult.secure_url,
      resourceType: uploadResult.resource_type,
      format: uploadResult.format,
      width: uploadResult.width,
      height: uploadResult.height,
      bytes: uploadResult.bytes,
      folder: uploadResult.folder,
      altText
    }
  });

  return NextResponse.redirect(new URL("/admin/media-settings?status=success", request.url));
}
