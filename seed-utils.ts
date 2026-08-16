import { hash } from "bcryptjs";
import crypto from "node:crypto";

export async function createPasswordHash(password: string) {
  return hash(password, 12);
}

export function encryptText(value: string) {
  const rawKey = process.env.APP_ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error("APP_ENCRYPTION_KEY is missing for seed.");
  }

  const key = Buffer.from(rawKey, "hex");
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-gcm", key, iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: authTag.toString("hex")
  });
}
