import crypto from "node:crypto";

const algorithm = "aes-256-gcm";

function getEncryptionKey() {
  const rawKey = process.env.APP_ENCRYPTION_KEY;
  if (!rawKey) {
    throw new Error("APP_ENCRYPTION_KEY is missing.");
  }

  return Buffer.from(rawKey, "hex");
}

export function encryptText(value: string) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv(algorithm, getEncryptionKey(), iv);
  const encrypted = Buffer.concat([cipher.update(value, "utf8"), cipher.final()]);
  const authTag = cipher.getAuthTag();

  return JSON.stringify({
    iv: iv.toString("hex"),
    content: encrypted.toString("hex"),
    tag: authTag.toString("hex")
  });
}

export function decryptText(payload: string) {
  const parsed = JSON.parse(payload) as {
    iv: string;
    content: string;
    tag: string;
  };

  const decipher = crypto.createDecipheriv(
    algorithm,
    getEncryptionKey(),
    Buffer.from(parsed.iv, "hex")
  );

  decipher.setAuthTag(Buffer.from(parsed.tag, "hex"));
  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(parsed.content, "hex")),
    decipher.final()
  ]);

  return decrypted.toString("utf8");
}

export function signPayload(payload: string) {
  const secret = process.env.AUTH_SESSION_SECRET;
  if (!secret) {
    throw new Error("AUTH_SESSION_SECRET is missing.");
  }

  return crypto.createHmac("sha256", secret).update(payload).digest("base64url");
}
