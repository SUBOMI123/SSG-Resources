import type { OrderPublicSummary } from "@/types/order";

export type BusinessProfile = {
  name: string;
  support_email: string;
  support_phone: string;
  address: string;
};

export type DocumentParty = {
  name: string;
  email: string;
  phone: string;
  address: string;
};

export type InvoiceDocument = {
  kind: "invoice";
  document_number: string;
  issued_at: Date;
  order_reference: string;
  business: BusinessProfile;
  customer: DocumentParty;
  payment_status: OrderPublicSummary["payment_status"];
  fulfillment_status: OrderPublicSummary["fulfillment_status"];
  subtotal: number;
  total: number;
  amount_paid: number;
  balance_due: number;
  items: OrderPublicSummary["items"];
  notes: string | null;
};

export type WaybillDocument = {
  kind: "waybill";
  document_number: string;
  issued_at: Date;
  order_reference: string;
  business: BusinessProfile;
  customer: DocumentParty;
  assigned_to: string | null | undefined;
  items: OrderPublicSummary["items"];
  delivery_instructions: string | null;
};

const BUSINESS_PROFILE: BusinessProfile = {
  name: "SSG Resources",
  support_email: "orders@ssg-resources.local",
  support_phone: "+234 800 000 0000",
  address: "Lagos, Nigeria",
};

function normalizeTimestamp(date: Date) {
  return date.toISOString().slice(0, 10).replace(/-/g, "");
}

export function buildInvoiceDocument(order: OrderPublicSummary): InvoiceDocument {
  return {
    kind: "invoice",
    document_number: `INV-${normalizeTimestamp(order.created_at)}-${order.reference}`,
    issued_at: new Date(),
    order_reference: order.reference,
    business: BUSINESS_PROFILE,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.delivery_address,
    },
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    subtotal: order.total,
    total: order.total,
    amount_paid: order.amount_paid,
    balance_due: order.balance_due,
    items: order.items,
    notes: order.payment_url ? `Payment link: ${order.payment_url}` : null,
  };
}

export function buildWaybillDocument(order: OrderPublicSummary): WaybillDocument {
  return {
    kind: "waybill",
    document_number: `WBL-${normalizeTimestamp(order.created_at)}-${order.reference}`,
    issued_at: new Date(),
    order_reference: order.reference,
    business: BUSINESS_PROFILE,
    customer: {
      name: order.customer_name,
      email: order.customer_email,
      phone: order.customer_phone,
      address: order.delivery_address,
    },
    assigned_to: order.assigned_to,
    items: order.items,
    delivery_instructions: order.delivery_address,
  };
}

export function formatCurrency(value: number) {
  return `₦${value.toLocaleString()}`;
}

export function formatDocumentDate(value: Date) {
  return value.toLocaleString();
}
