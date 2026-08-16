import { compare, hash } from "bcryptjs";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { signPayload } from "@/lib/crypto";
import { prisma } from "@/lib/prisma";

const SESSION_COOKIE = "visemfood_admin_session";

export type SessionPayload = {
  userId: string;
  role: string;
  email: string;
  name: string;
};

function encodeSession(payload: SessionPayload) {
  const body = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = signPayload(body);
  return `${body}.${signature}`;
}

export function decodeSession(token: string | undefined): SessionPayload | null {
  if (!token) return null;
  const [body, signature] = token.split(".");
  if (!body || !signature) return null;
  if (signPayload(body) !== signature) return null;

  try {
    return JSON.parse(Buffer.from(body, "base64url").toString("utf8")) as SessionPayload;
  } catch {
    return null;
  }
}

export async function createPasswordHash(password: string) {
  return hash(password, 12);
}

export async function verifyPassword(password: string, passwordHash: string) {
  return compare(password, passwordHash);
}

export async function getSession() {
  const cookieStore = await cookies();
  return decodeSession(cookieStore.get(SESSION_COOKIE)?.value);
}

export async function requireAdminSession() {
  const session = await getSession();
  if (!session) {
    redirect("/admin/login");
  }
  return session;
}

export async function requireRole(roles: string[]) {
  const session = await requireAdminSession();
  if (!roles.includes(session.role)) {
    redirect("/admin");
  }
  return session;
}

export async function loginAdmin(email: string, password: string) {
  const user = await prisma.user.findUnique({
    where: { email },
    include: { role: true }
  });

  if (!user || !user.isActive) {
    return { ok: false, message: "Invalid credentials." };
  }

  const isValid = await verifyPassword(password, user.passwordHash);
  if (!isValid) {
    return { ok: false, message: "Invalid credentials." };
  }

  await prisma.user.update({
    where: { id: user.id },
    data: { lastLoginAt: new Date() }
  });

  const cookieStore = await cookies();
  cookieStore.set(
    SESSION_COOKIE,
    encodeSession({
      userId: user.id,
      role: user.role.slug,
      email: user.email,
      name: user.name
    }),
    {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      path: "/",
      maxAge: 60 * 60 * 24 * 7
    }
  );

  return { ok: true };
}

export async function logoutAdmin() {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}
