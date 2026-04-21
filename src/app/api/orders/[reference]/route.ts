import { NextResponse } from "next/server";

import { getOrderByReference } from "@/lib/orders";

type RouteContext = {
  params: Promise<{
    reference: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { reference } = await context.params;
  const order = await getOrderByReference(reference);

  if (!order) {
    return NextResponse.json({ error: "Order not found." }, { status: 404 });
  }

  return NextResponse.json({ order });
}
