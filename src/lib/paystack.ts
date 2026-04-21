import { createHmac, timingSafeEqual } from "node:crypto";

import type { PaystackInitializeResponse, PaystackVerifyResponse } from "@/types/order";

const PAYSTACK_BASE_URL = "https://api.paystack.co";

function getSecretKey() {
  return process.env.PAYSTACK_SECRET_KEY;
}

export function isPaystackConfigured() {
  return Boolean(process.env.PAYSTACK_SECRET_KEY && process.env.PAYSTACK_PUBLIC_KEY);
}

function getHeaders() {
  const secret = getSecretKey();
  if (!secret) {
    throw new Error("PAYSTACK_NOT_CONFIGURED");
  }

  return {
    Authorization: `Bearer ${secret}`,
    "Content-Type": "application/json",
  };
}

export async function initializePaystackTransaction(input: {
  email: string;
  amount: number;
  reference: string;
  callback_url?: string;
  metadata?: Record<string, unknown>;
}) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/initialize`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      email: input.email,
      amount: Math.round(input.amount * 100),
      reference: input.reference,
      callback_url: input.callback_url,
      metadata: input.metadata,
    }),
  });

  const data = (await response.json()) as PaystackInitializeResponse | { message?: string };
  if (!response.ok || !("status" in data) || data.status !== true) {
    throw new Error(("message" in data && data.message) || "PAYSTACK_INIT_FAILED");
  }

  return data.data;
}

export async function verifyPaystackTransaction(reference: string) {
  const response = await fetch(`${PAYSTACK_BASE_URL}/transaction/verify/${reference}`, {
    method: "GET",
    headers: getHeaders(),
  });

  const data = (await response.json()) as PaystackVerifyResponse | { message?: string };
  if (!response.ok || !("status" in data) || data.status !== true) {
    throw new Error(("message" in data && data.message) || "PAYSTACK_VERIFY_FAILED");
  }

  return data.data;
}

export function validatePaystackWebhook(signature: string | null, rawBody: string) {
  const secret = getSecretKey();
  if (!secret || !signature) {
    return false;
  }

  const expected = createHmac("sha512", secret).update(rawBody).digest("hex");
  const expectedBuffer = Buffer.from(expected, "utf8");
  const actualBuffer = Buffer.from(signature, "utf8");

  if (expectedBuffer.length !== actualBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, actualBuffer);
}
