import { NextResponse } from "next/server";

import { markOrderAsFailed, markOrderAsPaid } from "@/lib/orders";
import { isPaystackConfigured, verifyPaystackTransaction } from "@/lib/paystack";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { reference?: string };
    if (!body.reference) {
      return NextResponse.json({ error: "Reference is required." }, { status: 400 });
    }

    if (!isPaystackConfigured()) {
      return NextResponse.json(
        { error: "Paystack is not configured." },
        { status: 503 },
      );
    }

    const verification = await verifyPaystackTransaction(body.reference);
    if (verification.status === "success") {
      await markOrderAsPaid(verification.reference);
    } else {
      await markOrderAsFailed(verification.reference);
    }

    return NextResponse.json({
      success: verification.status === "success",
      status: verification.status,
      reference: verification.reference,
    });
  } catch (error) {
    console.error("Paystack verification failed", error);
    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 },
    );
  }
}
