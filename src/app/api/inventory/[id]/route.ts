import { NextResponse } from "next/server";

import { deleteInventoryProduct, getInventory, updateInventory } from "@/lib/inventory";
import type { InventoryUpdateRequest } from "@/types/inventory";

type RouteContext = {
  params: Promise<{
    id: string;
  }>;
};

export async function GET(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const item = await getInventory(id);
    if (!item) {
      return NextResponse.json({ error: "Product not found." }, { status: 404 });
    }

    return NextResponse.json({ item });
  } catch (error) {
    console.error("Failed to get inventory item", error);
    return NextResponse.json(
      { error: "Failed to fetch inventory item." },
      { status: 500 },
    );
  }
}

export async function PUT(request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const body = (await request.json()) as Partial<InventoryUpdateRequest>;
    if (typeof body.new_quantity !== "number") {
      return NextResponse.json(
        { error: "new_quantity is required." },
        { status: 400 },
      );
    }

    const result = await updateInventory({
      product_id: id,
      new_quantity: body.new_quantity,
      reason: body.reason ?? "MANUAL_UPDATE",
      changed_by: body.changed_by ?? "admin-dashboard",
    });

    if ("code" in result) {
      const status =
        result.code === "PRODUCT_NOT_FOUND"
          ? 404
          : result.code === "INVALID_QUANTITY"
            ? 400
            : result.code === "INSUFFICIENT_STOCK"
              ? 409
              : 500;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to update inventory item", error);
    return NextResponse.json(
      { error: "Failed to update inventory item." },
      { status: 500 },
    );
  }
}

export async function DELETE(_request: Request, context: RouteContext) {
  const { id } = await context.params;

  try {
    const result = await deleteInventoryProduct(id);

    if ("code" in result) {
      const status =
        result.code === "PRODUCT_NOT_FOUND"
          ? 404
          : result.code === "PRODUCT_IN_USE"
            ? 409
            : 500;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to delete inventory item", error);
    return NextResponse.json(
      { error: "Failed to remove product." },
      { status: 500 },
    );
  }
}
