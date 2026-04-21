import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import type {
  InventoryCreateRequest,
  InventoryError,
  InventoryItem,
  InventoryUpdateRequest,
  InventoryUpdateResponse,
} from "@/types/inventory";

function toInventoryItem<T extends {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  unit_price: number;
  quantity_on_hand: number;
  reserved: number;
  available: number;
  created_at: Date;
  updated_at: Date;
}>(product: T): InventoryItem {
  return {
    ...product,
    available: product.quantity_on_hand - product.reserved,
  };
}

export async function getInventory(productId: string): Promise<InventoryItem | null> {
  const product = await prisma.product.findUnique({
    where: { id: productId },
  });

  return product ? toInventoryItem(product) : null;
}

export async function listInventory(): Promise<InventoryItem[]> {
  const products = await prisma.product.findMany({
    orderBy: [{ name: "asc" }],
  });

  return products.map(toInventoryItem);
}

export async function createInventoryProduct(
  request: InventoryCreateRequest,
): Promise<InventoryUpdateResponse | InventoryError> {
  const name = request.name.trim();
  const sku = request.sku.trim().toUpperCase();
  const slug = request.slug.trim().toLowerCase();
  const description = request.description?.trim() || null;

  if (!name || !sku || !slug) {
    return { code: "INVALID_QUANTITY", message: "Name, SKU, and slug are required." };
  }

  if (request.unit_price < 0 || request.quantity_on_hand < 0) {
    return { code: "INVALID_QUANTITY", message: "Price and quantity must be zero or greater." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const existing = await tx.product.findFirst({
        where: {
          OR: [{ name }, { sku }, { slug }],
        },
      });

      if (existing) {
        throw new Error("PRODUCT_ALREADY_EXISTS");
      }

      const created = await tx.product.create({
        data: {
          name,
          sku,
          slug,
          description,
          unit_price: request.unit_price,
          quantity_on_hand: request.quantity_on_hand,
          reserved: 0,
          available: request.quantity_on_hand,
          is_active: true,
        },
      });

      const history = await tx.inventoryHistory.create({
        data: {
          product_id: created.id,
          previous_quantity: 0,
          new_quantity: request.quantity_on_hand,
          change_reason: "MANUAL_UPDATE",
          changed_by: request.changed_by,
        },
      });

      return {
        product: toInventoryItem(created),
        previous_quantity: 0,
        change_amount: request.quantity_on_hand,
        history_id: history.id,
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return { success: true, ...result };
  } catch (error) {
    const message = error instanceof Error ? error.message : "TRANSACTION_FAILED";

    if (message === "PRODUCT_ALREADY_EXISTS") {
      return {
        code: "PRODUCT_ALREADY_EXISTS",
        message: "A product with this name, SKU, or slug already exists.",
      };
    }

    return { code: "TRANSACTION_FAILED", message: "Failed to add product." };
  }
}

export async function deleteInventoryProduct(
  productId: string,
): Promise<{ success: true; product_id: string } | InventoryError> {
  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
        include: {
          order_items: {
            select: { id: true },
            take: 1,
          },
        },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (product.reserved > 0 || product.order_items.length > 0) {
        throw new Error("PRODUCT_IN_USE");
      }

      await tx.product.delete({
        where: { id: productId },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return { success: true, product_id: productId };
  } catch (error) {
    const message = error instanceof Error ? error.message : "TRANSACTION_FAILED";

    if (message === "PRODUCT_NOT_FOUND") {
      return { code: "PRODUCT_NOT_FOUND", message: "Product not found." };
    }

    if (message === "PRODUCT_IN_USE") {
      return {
        code: "PRODUCT_IN_USE",
        message: "This product cannot be removed because it is already linked to orders or reserved stock.",
      };
    }

    return { code: "TRANSACTION_FAILED", message: "Failed to remove product." };
  }
}

export async function updateInventory(
  request: InventoryUpdateRequest,
): Promise<InventoryUpdateResponse | InventoryError> {
  if (request.new_quantity < 0) {
    return { code: "INVALID_QUANTITY", message: "Quantity cannot be negative." };
  }

  try {
    const result = await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: request.product_id },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const previousQuantity = product.quantity_on_hand;
      const nextAvailable = request.new_quantity - product.reserved;
      if (nextAvailable < 0) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const updated = await tx.product.update({
        where: { id: request.product_id },
        data: {
          quantity_on_hand: request.new_quantity,
          available: nextAvailable,
        },
      });

      const history = await tx.inventoryHistory.create({
        data: {
          product_id: request.product_id,
          previous_quantity: previousQuantity,
          new_quantity: request.new_quantity,
          change_reason: request.reason,
          changed_by: request.changed_by,
        },
      });

      return {
        product: toInventoryItem(updated),
        previous_quantity: previousQuantity,
        change_amount: request.new_quantity - previousQuantity,
        history_id: history.id,
      };
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return {
      success: true,
      ...result,
    };
  } catch (error) {
    const message = error instanceof Error ? error.message : "TRANSACTION_FAILED";

    if (message === "PRODUCT_NOT_FOUND") {
      return { code: "PRODUCT_NOT_FOUND", message: "Product not found." };
    }
    if (message === "INSUFFICIENT_STOCK") {
      return {
        code: "INSUFFICIENT_STOCK",
        message: "Reserved stock exceeds the requested on-hand quantity.",
      };
    }

    return { code: "TRANSACTION_FAILED", message: "Failed to update inventory." };
  }
}

export async function reserveInventory(
  productId: string,
  quantity: number,
  changedBy = "system",
): Promise<true | InventoryError> {
  if (quantity <= 0) {
    return { code: "INVALID_QUANTITY", message: "Quantity must be greater than zero." };
  }

  try {
    await prisma.$transaction(async (tx) => {
      const product = await tx.product.findUnique({
        where: { id: productId },
      });

      if (!product) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      const nextAvailable = product.quantity_on_hand - product.reserved - quantity;
      if (nextAvailable < 0) {
        throw new Error("INSUFFICIENT_STOCK");
      }

      const updated = await tx.product.update({
        where: { id: productId },
        data: {
          reserved: { increment: quantity },
          available: nextAvailable,
        },
      });

      await tx.inventoryHistory.create({
        data: {
          product_id: productId,
          previous_quantity: product.quantity_on_hand,
          new_quantity: updated.quantity_on_hand,
          change_reason: "ORDER_PLACED",
          changed_by: changedBy,
        },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "TRANSACTION_FAILED";

    if (message === "PRODUCT_NOT_FOUND") {
      return { code: "PRODUCT_NOT_FOUND", message: "Product not found." };
    }
    if (message === "INSUFFICIENT_STOCK") {
      return { code: "INSUFFICIENT_STOCK", message: "Insufficient available stock." };
    }

    return { code: "TRANSACTION_FAILED", message: "Failed to reserve inventory." };
  }
}
