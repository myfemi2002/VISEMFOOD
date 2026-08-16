# VISEMFOOD Cloudinary Admin Setup

## Purpose
This document defines the recommended implementation approach for making Cloudinary configurable from the VISEMFOOD admin panel instead of hardcoding credentials in the source code.

The goal is to allow the admin team to manage Cloudinary connection settings manually from the backend while keeping private credentials secure.

## Key Principle
Cloudinary should be configured in two layers:

- **Public delivery layer**
  Used for rendering images on the frontend.
- **Private server layer**
  Used for uploads, signed operations, and any action that requires the API secret.

The API secret must never be exposed in client-side code.

## Recommended Admin Section
Create the following section in the admin panel:

`Admin > Settings > Media > Cloudinary`

## Fields to Manage in Admin

### Required Fields
- Cloud Name
- API Key
- API Secret

### Optional Fields
- Upload Preset
- Default Folder
- Is Enabled
- Use Secure URLs

### Recommended Extra Actions
- Test Connection button
- Upload Sample Image button
- Reset Settings button

## Recommended Database Table
Use a table such as `media_settings`.

### Example Fields
- `id`
- `provider`
- `cloud_name`
- `api_key`
- `api_secret_encrypted`
- `upload_preset`
- `default_folder`
- `secure_urls`
- `is_enabled`
- `created_at`
- `updated_at`

### Notes
- `provider` allows future support for other media providers
- `api_secret_encrypted` should be encrypted before saving
- `is_enabled` allows the app to disable Cloudinary temporarily if needed

## Example Prisma Model
```prisma
model MediaSetting {
  id                   String   @id @default(cuid())
  provider             String   @default("cloudinary")
  cloudName            String
  apiKey               String
  apiSecretEncrypted   String
  uploadPreset         String?
  defaultFolder        String?
  secureUrls           Boolean  @default(true)
  isEnabled            Boolean  @default(true)
  createdAt            DateTime @default(now())
  updatedAt            DateTime @updatedAt
}
```

## Security Rules

### Must Do
- Encrypt the API secret before storing it in the database
- Decrypt the API secret only on the server
- Never return the API secret in API responses
- Never expose the API secret in React client components

### Safe to Expose
- Cloud name
- Public image URLs
- Public IDs
- API key only if required for a public upload flow

## Recommended Encryption Strategy
Use a server-side application secret such as:

- `APP_ENCRYPTION_KEY`

This key should remain in environment variables and should not be editable from the admin panel.

The idea is:
- Cloudinary values are admin-managed
- Encryption key remains deployment-managed

That gives flexibility without compromising security.

## Recommended Next.js Backend Structure

### Suggested Files
- `src/lib/cloudinary.ts`
- `src/lib/encryption.ts`
- `src/lib/settings/media-settings.ts`
- `src/app/api/admin/settings/media/route.ts`
- `src/app/api/admin/settings/media/test/route.ts`
- `src/app/api/admin/media/upload/route.ts`

## Example Encryption Utility
```ts
import crypto from "crypto";

const algorithm = "aes-256-gcm";
const key = Buffer.from(process.env.APP_ENCRYPTION_KEY!, "hex");

export function encryptText(value: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, key, iv);

  const encrypted = Buffer.concat([
    cipher.update(value, "utf8"),
    cipher.final(),
  ]);

  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: authTag.toString("hex"),
  });
}

export function decryptText(payload: string) {
  const parsed = JSON.parse(payload);
  const decipher = crypto.createDecipheriv(
    algorithm,
    key,
    Buffer.from(parsed.iv, "hex"),
  );

  decipher.setAuthTag(Buffer.from(parsed.tag, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.content, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf8");
}
```

## Example Cloudinary Server Utility
```ts
import { v2 as cloudinary } from "cloudinary";
import { decryptText } from "@/lib/encryption";
import { getMediaSettings } from "@/lib/settings/media-settings";

export async function getCloudinaryClient() {
  const settings = await getMediaSettings();

  if (!settings || !settings.isEnabled) {
    throw new Error("Cloudinary is not configured.");
  }

  cloudinary.config({
    cloud_name: settings.cloudName,
    api_key: settings.apiKey,
    api_secret: decryptText(settings.apiSecretEncrypted),
    secure: settings.secureUrls,
  });

  return cloudinary;
}
```

## Example Settings Reader
```ts
import { prisma } from "@/lib/prisma";

export async function getMediaSettings() {
  return prisma.mediaSetting.findFirst({
    where: {
      provider: "cloudinary",
    },
  });
}
```

## Example Admin Save Flow

### When Admin Saves Settings
1. Validate the inputs
2. Encrypt the API secret
3. Save values to the database
4. Return success message

### Example Server Logic
```ts
import { prisma } from "@/lib/prisma";
import { encryptText } from "@/lib/encryption";

export async function saveCloudinarySettings(input: {
  cloudName: string;
  apiKey: string;
  apiSecret: string;
  uploadPreset?: string;
  defaultFolder?: string;
  secureUrls?: boolean;
  isEnabled?: boolean;
}) {
  const encryptedSecret = encryptText(input.apiSecret);

  return prisma.mediaSetting.upsert({
    where: { provider: "cloudinary" },
    update: {
      cloudName: input.cloudName,
      apiKey: input.apiKey,
      apiSecretEncrypted: encryptedSecret,
      uploadPreset: input.uploadPreset ?? null,
      defaultFolder: input.defaultFolder ?? null,
      secureUrls: input.secureUrls ?? true,
      isEnabled: input.isEnabled ?? true,
    },
    create: {
      provider: "cloudinary",
      cloudName: input.cloudName,
      apiKey: input.apiKey,
      apiSecretEncrypted: encryptedSecret,
      uploadPreset: input.uploadPreset ?? null,
      defaultFolder: input.defaultFolder ?? null,
      secureUrls: input.secureUrls ?? true,
      isEnabled: input.isEnabled ?? true,
    },
  });
}
```

## Example Test Connection Route
The admin should be able to test whether the current credentials are valid.

### Example Logic
```ts
import { getCloudinaryClient } from "@/lib/cloudinary";

export async function testCloudinaryConnection() {
  const cloudinary = await getCloudinaryClient();
  return cloudinary.api.ping();
}
```

If the connection works:
- return success
- show `Cloudinary connected successfully`

If it fails:
- return error message
- show `Invalid credentials or connection failed`

## Example Upload Flow
Uploads should happen through a server route, not directly from client code using the secret.

### Recommended Flow
1. Admin selects an image file
2. Frontend sends file to a secure backend route
3. Backend reads current Cloudinary settings
4. Backend uploads the file to Cloudinary
5. Backend stores returned metadata in the database

### Example Upload Route Logic
```ts
import { getCloudinaryClient } from "@/lib/cloudinary";

export async function uploadProductImage(filePath: string) {
  const cloudinary = await getCloudinaryClient();

  return cloudinary.uploader.upload(filePath, {
    folder: "visemfood/products",
  });
}
```

## How Product Images Should Be Stored
Do not store full hardcoded transformation URLs in the database as the main source of truth.

Store:
- `public_id`
- `secure_url`
- `width`
- `height`
- `format`
- `resource_type`

### Recommended Product Image Table
`media_assets`

Fields:
- `id`
- `provider`
- `public_id`
- `secure_url`
- `width`
- `height`
- `format`
- `resource_type`
- `folder`
- `created_at`

## Frontend Rendering Strategy
For frontend rendering, the cleanest pattern is:

1. store Cloudinary `public_id` with each product
2. render product images using `CldImage`
3. keep all secret operations on the server

### Example Product Rendering
```tsx
"use client";

import { CldImage } from "next-cloudinary";

type ProductImageProps = {
  publicId: string;
  alt: string;
};

export function ProductImage({ publicId, alt }: ProductImageProps) {
  return (
    <CldImage
      src={publicId}
      width="500"
      height="500"
      crop={{
        type: "auto",
        source: true,
      }}
      alt={alt}
    />
  );
}
```

## Important Runtime Note
`next-cloudinary` commonly relies on the public cloud name being configured for the app. In practice:

- the public cloud name can come from a public environment variable
- secret-backed operations should come from the database-driven server configuration

If VISEMFOOD plans to change the Cloudinary account often from the admin panel, a custom server-generated image URL approach may eventually be more flexible than relying entirely on frontend configuration.

For phase one, the recommended pattern is:
- dynamic server-side Cloudinary credentials
- stable frontend cloud name
- admin-managed uploads and assets

## Recommended Admin UX

### Settings Form
- Cloud Name input
- API Key input
- API Secret password field
- Upload Preset input
- Default Folder input
- Enable Cloudinary toggle
- Secure URL toggle

### Action Buttons
- Save Settings
- Test Connection
- Upload Test File

### Status Indicators
- Connected
- Not Configured
- Invalid Credentials

## Best Practice for VISEMFOOD
For this project, the best balance is:

- Cloudinary settings saved from admin
- secret encrypted in DB
- backend routes handling upload and credential use
- public image rendering through stored public IDs
- admin-managed image upload for products, homepage banners, trays, and content pages

## Conclusion
The best implementation for VISEMFOOD is not to hardcode Cloudinary credentials in `cloudinary.config()` inside source files. Instead, Cloudinary should be managed from the admin panel through a secure settings module backed by encrypted database storage and server-only usage of the API secret.
