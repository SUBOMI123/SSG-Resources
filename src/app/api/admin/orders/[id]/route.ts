import { NextResponse } from "next/server";

import { deleteAdminOrder, updateAdminOrder } from "@/lib/orders";
import type { AdminOrderUpdateRequest } from "@/types/order";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function PATCH(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as AdminOrderUpdateRequest;
    const result = await updateAdminOrder(id, body);

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
    console.error("Failed to update admin order", error);
    return NextResponse.json(
      { error: "Failed to update order." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const result = await deleteAdminOrder(id);

    if (result !== true) {
      const status = result.code === "PRODUCT_NOT_FOUND" ? 404 : 409;
      return NextResponse.json(result, { status });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Failed to delete admin order", error);
    return NextResponse.json(
      { error: "Failed to remove order." },
      { status: 500 },
    );
  }
}
