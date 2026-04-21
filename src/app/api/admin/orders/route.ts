import { NextResponse } from "next/server";

import { createManualOrder, listAdminOrders } from "@/lib/orders";
import type { ManualOrderRequest } from "@/types/order";

export async function GET() {
  try {
    const orders = await listAdminOrders();
    return NextResponse.json({ orders });
  } catch (error) {
    console.error("Failed to list admin orders", error);
    return NextResponse.json({ error: "Failed to load orders." }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<ManualOrderRequest>;
    const result = await createManualOrder({
      customer_name: body.customer_name ?? "",
      customer_email: body.customer_email ?? "",
      customer_phone: body.customer_phone ?? "",
      delivery_address: body.delivery_address ?? "",
      notes: body.notes,
      items: body.items,
      product_slug: body.product_slug ?? "",
      quantity: body.quantity ?? 0,
      assigned_to: body.assigned_to,
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
    console.error("Failed to create manual order", error);
    return NextResponse.json(
      { error: "Failed to create manual order." },
      { status: 500 },
    );
  }
}
