import { NextResponse } from "next/server";

import { listInventory } from "@/lib/inventory";
import { parseManualOrderText } from "@/lib/order-parser";
import type { ManualOrderProductOption } from "@/types/order";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { raw_text?: string };
    const rawText = body.raw_text?.trim() ?? "";

    if (!rawText) {
      return NextResponse.json(
        { error: "raw_text is required." },
        { status: 400 },
      );
    }

    const inventory = await listInventory();
    const products: ManualOrderProductOption[] = inventory.map((item) => ({
      id: item.id,
      name: item.name,
      slug: item.slug,
      sku: item.sku,
      available: item.available,
    }));

    const result = parseManualOrderText(rawText, products);
    return NextResponse.json(result);
  } catch (error) {
    console.error("Failed to parse manual order text", error);
    return NextResponse.json(
      { error: "Failed to parse manual order text." },
      { status: 500 },
    );
  }
}
