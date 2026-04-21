import { NextResponse } from "next/server";

import { markOrderAsFailed, markOrderAsPaid } from "@/lib/orders";
import { validatePaystackWebhook } from "@/lib/paystack";

export async function POST(request: Request) {
  const rawBody = await request.text();
  const signature = request.headers.get("x-paystack-signature");

  if (!validatePaystackWebhook(signature, rawBody)) {
    return NextResponse.json({ error: "Invalid signature." }, { status: 401 });
  }

  try {
    const payload = JSON.parse(rawBody) as {
      event?: string;
      data?: {
        status?: string;
        reference?: string;
      };
    };

    const reference = payload.data?.reference;
    if (!reference) {
      return NextResponse.json({ received: true });
    }

    if (payload.event === "charge.success" || payload.data?.status === "success") {
      await markOrderAsPaid(reference);
    } else if (payload.data?.status) {
      await markOrderAsFailed(reference);
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    console.error("Paystack webhook handling failed", error);
    return NextResponse.json({ error: "Webhook processing failed." }, { status: 500 });
  }
}
