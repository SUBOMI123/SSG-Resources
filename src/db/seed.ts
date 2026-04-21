import { prisma } from "@/lib/db";

function toSlug(value: string) {
  return value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

async function main() {
  const products = [
    {
      name: "2mm P",
      sku: "2MM_P",
      slug: "2mm-p",
      description: "Plastic roll 2mm",
      unit_price: 5000,
      quantity_on_hand: 150,
      is_active: true,
    },
    {
      name: "3mm P",
      sku: "3MM_P",
      slug: "3mm-p",
      description: "Plastic roll 3mm",
      unit_price: 6000,
      quantity_on_hand: 450,
      is_active: true,
    },
    {
      name: "4mm P",
      sku: "4MM_P",
      slug: "4mm-p",
      description: "Plastic roll 4mm",
      unit_price: 7000,
      quantity_on_hand: 100,
      is_active: true,
    },
    {
      name: "3m Mineral",
      sku: "3M_MINERAL",
      slug: "3m-mineral",
      description: "3m mineral",
      unit_price: 15000,
      quantity_on_hand: 50,
      is_active: true,
    },
    {
      name: "2mm F",
      sku: "2MM_F",
      slug: "2mm-f",
      description: "Film roll 2mm",
      unit_price: 4500,
      quantity_on_hand: 100,
      is_active: true,
    },
    {
      name: "Primer",
      sku: "PRIMER",
      slug: "primer",
      description: "Primer coat",
      unit_price: 3000,
      quantity_on_hand: 50,
      is_active: true,
    },
  ];

  for (const product of products) {
    await prisma.product.upsert({
      where: { sku: product.sku },
      update: {
        name: product.name,
        slug: product.slug ?? toSlug(product.name),
        description: product.description,
        unit_price: product.unit_price,
        is_active: product.is_active,
        quantity_on_hand: product.quantity_on_hand,
        available: product.quantity_on_hand,
      },
      create: {
        ...product,
        slug: product.slug ?? toSlug(product.name),
        available: product.quantity_on_hand,
      },
    });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
