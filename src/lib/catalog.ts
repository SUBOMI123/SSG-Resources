import { prisma } from "@/lib/db";
import type { CatalogProductCard, CatalogProductDetail } from "@/types/catalog";

function toCatalogProductCard(product: {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  unit_price: number;
  available: number;
}) : CatalogProductCard {
  return {
    ...product,
    isInStock: product.available > 0,
  };
}

export async function listCatalogProducts(query?: string): Promise<CatalogProductCard[]> {
  const term = query?.trim();
  const products = await prisma.product.findMany({
    where: {
      is_active: true,
      ...(term
        ? {
            OR: [
              { name: { contains: term, mode: "insensitive" } },
              { sku: { contains: term, mode: "insensitive" } },
              { description: { contains: term, mode: "insensitive" } },
            ],
          }
        : {}),
    },
    orderBy: [{ available: "desc" }, { name: "asc" }],
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      unit_price: true,
      available: true,
    },
  });

  return products.map(toCatalogProductCard);
}

export async function getCatalogProductBySlug(
  slug: string,
): Promise<CatalogProductDetail | null> {
  const product = await prisma.product.findFirst({
    where: {
      slug,
      is_active: true,
    },
    select: {
      id: true,
      name: true,
      slug: true,
      sku: true,
      description: true,
      unit_price: true,
      available: true,
      quantity_on_hand: true,
      reserved: true,
    },
  });

  return product
    ? {
        ...toCatalogProductCard(product),
        quantity_on_hand: product.quantity_on_hand,
        reserved: product.reserved,
      }
    : null;
}
