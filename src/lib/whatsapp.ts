import type { OrderPublicSummary } from "@/types/order";

const DEFAULT_WHATSAPP_NUMBER = "+234 800 000 0000";

function sanitizePhoneNumber(value: string) {
  return value.replace(/\D/g, "");
}

export function getBusinessWhatsAppDisplayNumber() {
  const configured = process.env.BUSINESS_WHATSAPP_NUMBER?.trim();
  if (configured) {
    return configured;
  }

  if (process.env.NODE_ENV === "production") {
    throw new Error("BUSINESS_WHATSAPP_NUMBER_NOT_CONFIGURED");
  }

  return DEFAULT_WHATSAPP_NUMBER;
}

export function getBusinessWhatsAppNumber() {
  return sanitizePhoneNumber(getBusinessWhatsAppDisplayNumber());
}

export function buildCheckoutWhatsAppUrl(order: Pick<
  OrderPublicSummary,
  "reference" | "customer_name" | "customer_phone" | "delivery_address" | "total" | "items"
>) {
  const lines = [
    `Hello SSG Resources, I want to confirm this order.`,
    "",
    `Order reference: ${order.reference}`,
    `Customer name: ${order.customer_name}`,
    `Customer phone: ${order.customer_phone}`,
    `Delivery address: ${order.delivery_address}`,
    "",
    "Items:",
    ...order.items.map(
      (item) => `- ${item.product_name} x ${item.quantity} (₦${item.line_total.toLocaleString()})`,
    ),
    "",
    `Total: ₦${order.total.toLocaleString()}`,
    "Please confirm payment steps and order processing.",
  ];

  return `https://wa.me/${getBusinessWhatsAppNumber()}?text=${encodeURIComponent(lines.join("\n"))}`;
}
