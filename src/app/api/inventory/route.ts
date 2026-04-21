import { NextResponse } from "next/server";

import { createInventoryProduct, listInventory } from "@/lib/inventory";
import type { InventoryCreateRequest } from "@/types/inventory";

export async function GET() {
  try {
    const items = await listInventory();
    return NextResponse.json({ items });
  } catch (error) {
    console.error("Failed to list inventory", error);
    return NextResponse.json(
      { error: "Failed to load inventory." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as Partial<InventoryCreateRequest>;
    if (
      typeof body.name !== "string" ||
      typeof body.sku !== "string" ||
      typeof body.slug !== "string" ||
      typeof body.unit_price !== "number" ||
      typeof body.quantity_on_hand !== "number"
    ) {
      return NextResponse.json(
        { error: "name, sku, slug, unit_price, and quantity_on_hand are required." },
        { status: 400 },
      );
    }

    const result = await createInventoryProduct({
      name: body.name,
      sku: body.sku,
      slug: body.slug,
      description: body.description,
      unit_price: body.unit_price,
      quantity_on_hand: body.quantity_on_hand,
      changed_by: body.changed_by ?? "admin-dashboard",
    });

    if ("code" in result) {
      const status =
        result.code === "INVALID_QUANTITY"
            ? 400
            : result.code === "PRODUCT_ALREADY_EXISTS"
              ? 409
              : 500;

      return NextResponse.json(result, { status });
    }

    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to create inventory product", error);
    return NextResponse.json(
      { error: "Failed to add product." },
      { status: 500 },
    );
  }
}
