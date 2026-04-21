import { NextResponse } from "next/server";

import { attachPaystackInitialization, getOrderByReference } from "@/lib/orders";
import { initializePaystackTransaction, isPaystackConfigured } from "@/lib/paystack";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reference?: string };
    if (!body.reference) {
      return NextResponse.json({ error: "Order reference is required." }, { status: 400 });
    }

    const order = await getOrderByReference(body.reference);
    if (!order) {
      return NextResponse.json({ error: "Order not found." }, { status: 404 });
    }

    if (!isPaystackConfigured()) {
      return NextResponse.json(
        {
          configured: false,
          provider: "paystack",
          status: "config_missing",
          message: "Paystack keys are not configured yet.",
        },
        { status: 503 },
      );
    }

    const origin = new URL(request.url).origin;
    const initialized = await initializePaystackTransaction({
      email: order.customer_email,
      amount: order.total,
      reference: order.reference,
      callback_url: `${origin}/checkout/success?reference=${order.reference}`,
      metadata: {
        orderReference: order.reference,
      },
    });

    await attachPaystackInitialization({
      reference: order.reference,
      paystack_reference: initialized.reference,
      paystack_access_code: initialized.access_code,
      payment_url: initialized.authorization_url,
    });

    return NextResponse.json({
      configured: true,
      provider: "paystack",
      status: "ready",
      authorization_url: initialized.authorization_url,
      access_code: initialized.access_code,
      reference: initialized.reference,
    });
  } catch (error) {
    console.error("Paystack initialization failed", error);
    return NextResponse.json(
      { error: "Unable to initialize payment." },
      { status: 500 },
    );
  }
}
