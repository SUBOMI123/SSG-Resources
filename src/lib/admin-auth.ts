import "server-only";

import { randomUUID } from "node:crypto";

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

import { prisma } from "@/lib/db";
import {
  ADMIN_SESSION_COOKIE,
  createAdminSessionToken,
  createPasswordHash,
  readAdminSessionToken,
  verifyPasswordHash,
} from "@/lib/session";

interface AdminRow {
  id: string;
  name: string;
  email: string;
  password_hash: string;
}

export async function countAdminUsers() {
  const result = await prisma.$queryRaw<Array<{ count: number }>>`
    SELECT COUNT(*)::int AS count
    FROM "AdminUser"
  `;
  return result[0]?.count ?? 0;
}

export async function hasAdminUsers() {
  return (await countAdminUsers()) > 0;
}

export async function createFirstAdmin(input: { name: string; email: string; password: string }) {
  const existing = await countAdminUsers();
  if (existing > 0) {
    return { error: "Setup is already complete. Please sign in." };
  }

  const name = input.name.trim();
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  if (!name || !email || password.length < 8) {
    return { error: "Name, email, and a password with at least 8 characters are required." };
  }

  const passwordHash = await createPasswordHash(password);
  const admin = await prisma.$queryRaw<Array<Pick<AdminRow, "id" | "name" | "email">>>`
    INSERT INTO "AdminUser" ("id", "name", "email", "password_hash", "updated_at")
    VALUES (${randomUUID()}, ${name}, ${email}, ${passwordHash}, NOW())
    RETURNING "id", "name", "email"
  `;

  return { admin: admin[0] };
}

export async function authenticateAdmin(input: { email: string; password: string }) {
  const email = input.email.trim().toLowerCase();
  const password = input.password.trim();

  const result = await prisma.$queryRaw<AdminRow[]>`
    SELECT "id", "name", "email", "password_hash"
    FROM "AdminUser"
    WHERE "email" = ${email}
    LIMIT 1
  `;
  const admin = result[0];

  if (!admin) {
    return { error: "Incorrect email or password." };
  }

  const valid = await verifyPasswordHash(password, admin.password_hash);
  if (!valid) {
    return { error: "Incorrect email or password." };
  }

  return { admin };
}

export async function getCurrentAdmin() {
  const cookieStore = await cookies();
  const token = cookieStore.get(ADMIN_SESSION_COOKIE)?.value;
  if (!token) {
    return null;
  }

  const session = await readAdminSessionToken(token);
  if (!session) {
    return null;
  }

  const result = await prisma.$queryRaw<Array<Pick<AdminRow, "id" | "name" | "email">>>`
    SELECT "id", "name", "email"
    FROM "AdminUser"
    WHERE "id" = ${session.userId}
    LIMIT 1
  `;

  return result[0] ?? null;
}

export async function requireCurrentAdmin() {
  const admin = await getCurrentAdmin();
  if (!admin) {
    redirect("/admin/login");
  }

  return admin;
}

export async function buildAdminSessionCookie(input: { userId: string; email: string }) {
  const token = await createAdminSessionToken(input);
  return token;
}
