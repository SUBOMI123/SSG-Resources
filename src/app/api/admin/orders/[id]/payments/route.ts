import { NextResponse } from "next/server";

import { recordOrderPayment } from "@/lib/orders";
import type { OrderPaymentCreateRequest } from "@/types/order";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function POST(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as OrderPaymentCreateRequest;
    const result = await recordOrderPayment(id, body);

    if ("code" in result) {
      const status =
        result.code === "INVALID_REQUEST"
          ? 400
          : result.code === "PRODUCT_NOT_FOUND"
            ? 404
            : 409;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({ order: result });
  } catch (error) {
    console.error("Failed to record order payment", error);
    return NextResponse.json(
      { error: "Failed to record payment." },
      { status: 500 },
    );
  }
}
