import { getAdminAuthSecret } from "@/lib/runtime-config";

const encoder = new TextEncoder();
const decoder = new TextDecoder();

export const ADMIN_SESSION_COOKIE = "ssg_admin_session";

type SessionPayload = {
  userId: string;
  email: string;
  exp: number;
};

function getAuthSecret() {
  return getAdminAuthSecret();
}

function toBase64Url(bytes: Uint8Array) {
  return Buffer.from(bytes)
    .toString("base64")
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/g, "");
}

function fromBase64Url(value: string) {
  const normalized = value.replace(/-/g, "+").replace(/_/g, "/");
  const padded = normalized.padEnd(Math.ceil(normalized.length / 4) * 4, "=");
  return new Uint8Array(Buffer.from(padded, "base64"));
}

async function importSigningKey() {
  return crypto.subtle.importKey(
    "raw",
    encoder.encode(getAuthSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign", "verify"],
  );
}

export async function createPasswordHash(password: string) {
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return `${toBase64Url(salt)}.${toBase64Url(new Uint8Array(derived))}`;
}

export async function verifyPasswordHash(password: string, storedHash: string) {
  const [saltPart, hashPart] = storedHash.split(".");
  if (!saltPart || !hashPart) {
    return false;
  }

  const salt = fromBase64Url(saltPart);
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, [
    "deriveBits",
  ]);
  const derived = await crypto.subtle.deriveBits(
    {
      name: "PBKDF2",
      salt,
      iterations: 120000,
      hash: "SHA-256",
    },
    key,
    256,
  );

  return toBase64Url(new Uint8Array(derived)) === hashPart;
}

export async function createAdminSessionToken(input: { userId: string; email: string }) {
  const payload: SessionPayload = {
    userId: input.userId,
    email: input.email,
    exp: Date.now() + 1000 * 60 * 60 * 24 * 14,
  };

  const payloadBytes = encoder.encode(JSON.stringify(payload));
  const key = await importSigningKey();
  const signature = await crypto.subtle.sign("HMAC", key, payloadBytes);

  return `${toBase64Url(payloadBytes)}.${toBase64Url(new Uint8Array(signature))}`;
}

export async function readAdminSessionToken(token: string): Promise<SessionPayload | null> {
  const [payloadPart, signaturePart] = token.split(".");
  if (!payloadPart || !signaturePart) {
    return null;
  }

  const payloadBytes = fromBase64Url(payloadPart);
  const signatureBytes = fromBase64Url(signaturePart);
  const key = await importSigningKey();
  const valid = await crypto.subtle.verify("HMAC", key, signatureBytes, payloadBytes);

  if (!valid) {
    return null;
  }

  const payload = JSON.parse(decoder.decode(payloadBytes)) as SessionPayload;
  if (payload.exp < Date.now()) {
    return null;
  }

  return payload;
}
