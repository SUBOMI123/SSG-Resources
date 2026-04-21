import { NextResponse } from "next/server";

import { createCheckoutOrder } from "@/lib/orders";
import type { CheckoutRequest } from "@/types/order";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<CheckoutRequest>;

    const result = await createCheckoutOrder({
      customer_name: body.customer_name ?? "",
      customer_email: body.customer_email ?? "",
      customer_phone: body.customer_phone ?? "",
      delivery_address: body.delivery_address ?? "",
      notes: body.notes,
      items: body.items ?? [],
    });

    if ("code" in result) {
      const status =
        result.code === "INVALID_REQUEST" || result.code === "INVALID_QUANTITY"
          ? 400
          : result.code === "PRODUCT_NOT_FOUND"
            ? 404
            : result.code === "INSUFFICIENT_STOCK"
              ? 409
              : 500;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Checkout failed", error);
    return NextResponse.json(
      { error: "Checkout could not be completed." },
      { status: 500 },
    );
  }
}
