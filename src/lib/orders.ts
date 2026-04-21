import { Prisma } from "@prisma/client";

import { prisma } from "@/lib/db";
import { buildCheckoutWhatsAppUrl } from "@/lib/whatsapp";
import type {
  AdminOrderListItem,
  AdminOrderUpdateRequest,
  CheckoutError,
  CheckoutOrderLine,
  CheckoutRequest,
  CheckoutResponse,
  ManualOrderRequest,
  OrderPaymentRecord,
  OrderPaymentCreateRequest,
  OrderPublicSummary,
} from "@/types/order";

function buildReference() {
  const stamp = Date.now().toString(36).toUpperCase();
  const random = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `SSG-${stamp}-${random}`;
}

function isCheckoutError(value: unknown): value is CheckoutError {
  return typeof value === "object" && value !== null && "code" in value && "message" in value;
}

function mapOrderPayments<T extends {
  id: string;
  amount: number;
  note: string | null;
  recorded_by: string;
  received_at: Date;
  created_at: Date;
}>(payments: T[]): OrderPaymentRecord[] {
  return payments.map((payment) => ({
    id: payment.id,
    amount: payment.amount,
    note: payment.note,
    recorded_by: payment.recorded_by,
    received_at: payment.received_at,
    created_at: payment.created_at,
  }));
}

function mapOrderSummary<T extends {
  id: string;
  reference: string;
  source: "WEB" | "MANUAL";
  assigned_to: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  payment_status: "PENDING" | "PARTIAL" | "PAID" | "FAILED";
  fulfillment_status: "PENDING" | "CONFIRMED" | "DELIVERED";
  total: number;
  amount_paid: number;
  balance_due: number;
  payment_url: string | null;
  created_at: Date;
  items: Array<{
    product_id: string | null;
    product_name: string;
    product_sku: string;
    product_slug: string;
    unit_price: number;
    quantity: number;
    line_total: number;
  }>;
  payments: Array<{
    id: string;
    amount: number;
    note: string | null;
    recorded_by: string;
    received_at: Date;
    created_at: Date;
  }>;
}>(order: T): AdminOrderListItem {
  return {
    id: order.id,
    reference: order.reference,
    source: order.source,
    assigned_to: order.assigned_to,
    customer_name: order.customer_name,
    customer_email: order.customer_email,
    customer_phone: order.customer_phone,
    delivery_address: order.delivery_address,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    total: order.total,
    amount_paid: order.amount_paid,
    balance_due: order.balance_due,
    items: order.items.map((line) => ({
      product_id: line.product_id ?? "",
      product_name: line.product_name,
      product_sku: line.product_sku,
      product_slug: line.product_slug,
      unit_price: line.unit_price,
      quantity: line.quantity,
      line_total: line.line_total,
    })),
    payments: mapOrderPayments(order.payments),
    payment_url: order.payment_url,
    created_at: order.created_at,
  };
}

export async function createCheckoutOrder(
  request: CheckoutRequest,
): Promise<CheckoutResponse | CheckoutError> {
  if (
    !request.customer_name.trim() ||
    !request.customer_email.trim() ||
    !request.customer_phone.trim()
  ) {
    return { code: "INVALID_REQUEST", message: "Customer name, email, and phone are required." };
  }

  if (!request.delivery_address.trim()) {
    return { code: "INVALID_REQUEST", message: "Delivery address is required." };
  }

  if (request.items.length === 0) {
    return { code: "INVALID_REQUEST", message: "At least one item is required for checkout." };
  }

  return createOrderInternal({
    request,
    source: "WEB",
    assigned_to: null,
    changed_by: "web-checkout",
  });
}

export async function createManualOrder(
  request: ManualOrderRequest,
): Promise<CheckoutResponse | CheckoutError> {
  if (
    !request.customer_name.trim() ||
    !request.customer_email.trim() ||
    !request.customer_phone.trim()
  ) {
    return { code: "INVALID_REQUEST", message: "Customer name, email, and phone are required." };
  }

  if (!request.delivery_address.trim()) {
    return { code: "INVALID_REQUEST", message: "Delivery address is required." };
  }

  const quantity = request.quantity;
  const items = request.items?.length
    ? request.items
    : request.product_slug && typeof quantity === "number" && Number.isInteger(quantity) && quantity > 0
      ? [
          {
            product_slug: request.product_slug,
            quantity,
          },
        ]
      : [];

  if (items.length === 0) {
    return { code: "INVALID_QUANTITY", message: "At least one valid product line is required." };
  }

  return createOrderInternal({
    request: {
      customer_name: request.customer_name,
      customer_email: request.customer_email,
      customer_phone: request.customer_phone,
      delivery_address: request.delivery_address,
      notes: request.notes,
      items,
    },
    source: "MANUAL",
    assigned_to: request.assigned_to?.trim() || null,
    changed_by: "admin-manual-entry",
  });
}

async function createOrderInternal(input: {
  request: CheckoutRequest;
  source: "WEB" | "MANUAL";
  assigned_to: string | null;
  changed_by: string;
}): Promise<CheckoutResponse | CheckoutError> {
  try {
    const order = await prisma.$transaction(async (tx) => {
      const orderLines: CheckoutOrderLine[] = [];

      for (const item of input.request.items) {
        if (!item.product_slug || !Number.isInteger(item.quantity) || item.quantity <= 0) {
          throw { code: "INVALID_QUANTITY", message: "Each checkout item needs a valid quantity." };
        }

        const product = await tx.product.findFirst({
          where: {
            slug: item.product_slug,
            is_active: true,
          },
        });

        if (!product) {
          throw { code: "PRODUCT_NOT_FOUND", message: "One of the selected products could not be found." };
        }

        const nextAvailable = product.quantity_on_hand - product.reserved - item.quantity;
        if (nextAvailable < 0) {
          throw {
            code: "INSUFFICIENT_STOCK",
            message: `${product.name} no longer has enough stock for the requested quantity.`,
          };
        }

        const updated = await tx.product.update({
          where: { id: product.id },
          data: {
            reserved: { increment: item.quantity },
            available: nextAvailable,
          },
        });

        await tx.inventoryHistory.create({
          data: {
            product_id: product.id,
            previous_quantity: product.quantity_on_hand,
            new_quantity: updated.quantity_on_hand,
            change_reason: "ORDER_PLACED",
            changed_by: input.changed_by,
          },
        });

        orderLines.push({
          product_id: product.id,
          product_name: product.name,
          product_sku: product.sku,
          product_slug: product.slug,
          unit_price: product.unit_price,
          quantity: item.quantity,
          line_total: product.unit_price * item.quantity,
        });
      }

      const total = orderLines.reduce((sum, line) => sum + line.line_total, 0);
      const reference = buildReference();

      const created = await tx.order.create({
        data: {
          reference,
          source: input.source,
          assigned_to: input.assigned_to,
          customer_name: input.request.customer_name.trim(),
          customer_email: input.request.customer_email.trim(),
          customer_phone: input.request.customer_phone.trim(),
          delivery_address: input.request.delivery_address.trim(),
          notes: input.request.notes?.trim() || null,
          subtotal: total,
          total,
          amount_paid: 0,
          balance_due: total,
          items: {
            create: orderLines.map((line) => ({
              product_id: line.product_id,
              product_name: line.product_name,
              product_sku: line.product_sku,
              product_slug: line.product_slug,
              unit_price: line.unit_price,
              quantity: line.quantity,
              line_total: line.line_total,
            })),
          },
        },
        include: {
          items: true,
          payments: true,
        },
      });

      return {
        success: true,
        order: {
          reference: created.reference,
          source: created.source,
          assigned_to: created.assigned_to,
          payment_status: created.payment_status,
          fulfillment_status: created.fulfillment_status,
          total: created.total,
          amount_paid: created.amount_paid,
          balance_due: created.balance_due,
          items: created.items.map((line) => ({
            product_id: line.product_id ?? "",
            product_name: line.product_name,
            product_sku: line.product_sku,
            product_slug: line.product_slug,
            unit_price: line.unit_price,
            quantity: line.quantity,
            line_total: line.line_total,
          })),
        },
        payment_init: {
          provider: "whatsapp",
          status: "pending_contact",
          contact_label: "Send order on WhatsApp",
          contact_url: buildCheckoutWhatsAppUrl({
            reference: created.reference,
            customer_name: created.customer_name,
            customer_phone: created.customer_phone,
            delivery_address: created.delivery_address,
            total: created.total,
            items: created.items.map((line) => ({
              product_id: line.product_id ?? "",
              product_name: line.product_name,
              product_sku: line.product_sku,
              product_slug: line.product_slug,
              unit_price: line.unit_price,
              quantity: line.quantity,
              line_total: line.line_total,
            })),
          }),
        },
      } satisfies CheckoutResponse;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return order;
  } catch (error) {
    if (isCheckoutError(error)) {
      return error;
    }

    return { code: "ORDER_CREATION_FAILED", message: "Unable to create the order right now." };
  }
}

export async function getOrderByReference(
  reference: string,
): Promise<OrderPublicSummary | null> {
  const order = await prisma.order.findUnique({
    where: { reference },
    include: {
      items: true,
      payments: {
        orderBy: [{ received_at: "desc" }],
      },
    },
  });

  if (!order) {
    return null;
  }

  return mapOrderSummary(order);
}

export async function listAdminOrders(): Promise<AdminOrderListItem[]> {
  const orders = await prisma.order.findMany({
    include: {
      items: true,
      payments: {
        orderBy: [{ received_at: "desc" }],
      },
    },
    orderBy: [{ created_at: "desc" }],
  });

  return orders.map(mapOrderSummary);
}

export async function attachPaystackInitialization(input: {
  reference: string;
  paystack_reference: string;
  paystack_access_code: string;
  payment_url: string;
}) {
  return prisma.order.update({
    where: { reference: input.reference },
    data: {
      paystack_reference: input.paystack_reference,
      paystack_access_code: input.paystack_access_code,
      payment_url: input.payment_url,
    },
  });
}

export async function markOrderAsPaid(reference: string) {
  return prisma.$transaction(async (tx) => {
    const order = await tx.order.findUnique({
      where: { reference },
    });

    if (!order) {
      throw new Error("PRODUCT_NOT_FOUND");
    }

    const remaining = Math.max(order.total - order.amount_paid, 0);

    if (remaining > 0) {
      await tx.orderPayment.create({
        data: {
          order_id: order.id,
          amount: remaining,
          note: "Paystack payment confirmed",
          recorded_by: "paystack-webhook",
        },
      });
    }

    return tx.order.update({
      where: { reference },
      data: {
        amount_paid: order.total,
        balance_due: 0,
        payment_status: "PAID",
        fulfillment_status: "CONFIRMED",
        paid_at: new Date(),
      },
    });
  });
}

export async function markOrderAsFailed(reference: string) {
  return prisma.order.update({
    where: { reference },
    data: {
      payment_status: "FAILED",
    },
  });
}

export async function recordOrderPayment(
  id: string,
  request: OrderPaymentCreateRequest,
): Promise<AdminOrderListItem | CheckoutError> {
  if (!Number.isFinite(request.amount) || request.amount <= 0) {
    return { code: "INVALID_REQUEST", message: "Payment amount must be greater than zero." };
  }

  try {
    const updated = await prisma.$transaction(async (tx) => {
      const existing = await tx.order.findUnique({
        where: { id },
        include: {
          items: true,
          payments: {
            orderBy: [{ received_at: "desc" }],
          },
        },
      });

      if (!existing) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      if (request.amount > existing.balance_due) {
        throw new Error("INVALID_REQUEST");
      }

      await tx.orderPayment.create({
        data: {
          order_id: existing.id,
          amount: request.amount,
          note: request.note?.trim() || null,
          recorded_by: "admin-dashboard",
        },
      });

      const nextAmountPaid = existing.amount_paid + request.amount;
      const nextBalanceDue = Math.max(existing.total - nextAmountPaid, 0);
      const nextPaymentStatus =
        nextBalanceDue === 0
          ? "PAID"
          : nextAmountPaid > 0
            ? "PARTIAL"
            : "PENDING";

      const order = await tx.order.update({
        where: { id },
        data: {
          amount_paid: nextAmountPaid,
          balance_due: nextBalanceDue,
          payment_status: nextPaymentStatus,
          paid_at: nextBalanceDue === 0 ? existing.paid_at ?? new Date() : null,
        },
        include: {
          items: true,
          payments: {
            orderBy: [{ received_at: "desc" }],
          },
        },
      });

      return order;
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return mapOrderSummary(updated);
  } catch (error) {
    const message = error instanceof Error ? error.message : "ORDER_CREATION_FAILED";
    if (message === "PRODUCT_NOT_FOUND") {
      return { code: "PRODUCT_NOT_FOUND", message: "Order not found." };
    }
    if (message === "INVALID_REQUEST") {
      return { code: "INVALID_REQUEST", message: "Payment amount cannot be greater than the remaining balance." };
    }
    return { code: "ORDER_CREATION_FAILED", message: "Unable to record payment right now." };
  }
}

function normalizeAssignment(value: string | null | undefined) {
  const normalized = value?.trim();
  return normalized ? normalized : null;
}

function isValidFulfillmentTransition(
  current: "PENDING" | "CONFIRMED" | "DELIVERED",
  next: "PENDING" | "CONFIRMED" | "DELIVERED",
) {
  const order = ["PENDING", "CONFIRMED", "DELIVERED"];
  return order.indexOf(next) >= order.indexOf(current);
}

export async function updateAdminOrder(
  id: string,
  request: AdminOrderUpdateRequest,
): Promise<AdminOrderListItem | CheckoutError> {
  const existing = await prisma.order.findUnique({
    where: { id },
    include: {
      items: true,
    },
  });

  if (!existing) {
    return { code: "PRODUCT_NOT_FOUND", message: "Order not found." };
  }

  const nextFulfillmentStatus = request.fulfillment_status ?? existing.fulfillment_status;
  if (!isValidFulfillmentTransition(existing.fulfillment_status, nextFulfillmentStatus)) {
    return {
      code: "INVALID_REQUEST",
      message: "Fulfillment status cannot move backward in this workflow.",
    };
  }

  const nextPaymentStatus = request.payment_status ?? existing.payment_status;
  const nextAssignedTo =
    request.assigned_to !== undefined
      ? normalizeAssignment(request.assigned_to)
      : existing.assigned_to;

  if (request.payment_status === "PAID" && existing.balance_due > 0) {
    return {
      code: "INVALID_REQUEST",
      message: "Record the payment amount first before marking this order as fully paid.",
    };
  }

  const updated = await prisma.order.update({
    where: { id },
    data: {
      assigned_to: nextAssignedTo,
      fulfillment_status: nextFulfillmentStatus,
      payment_status: nextPaymentStatus,
      paid_at:
        nextPaymentStatus === "PAID"
          ? existing.paid_at ?? new Date()
          : nextPaymentStatus === "FAILED"
            ? null
            : existing.paid_at,
    },
    include: {
      items: true,
      payments: {
        orderBy: [{ received_at: "desc" }],
      },
    },
  });

  return mapOrderSummary(updated);
}

export async function deleteAdminOrder(id: string): Promise<true | CheckoutError> {
  try {
    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id },
        include: { items: true },
      });

      if (!order) {
        throw new Error("ORDER_NOT_FOUND");
      }

      for (const item of order.items) {
        if (!item.product_id) {
          continue;
        }

        const product = await tx.product.findUnique({
          where: { id: item.product_id },
        });

        if (!product) {
          continue;
        }

        const nextReserved = Math.max(product.reserved - item.quantity, 0);
        const nextAvailable = product.quantity_on_hand - nextReserved;

        await tx.product.update({
          where: { id: product.id },
          data: {
            reserved: nextReserved,
            available: nextAvailable,
          },
        });

        await tx.inventoryHistory.create({
          data: {
            product_id: product.id,
            previous_quantity: product.quantity_on_hand,
            new_quantity: product.quantity_on_hand,
            change_reason: "ORDER_CANCELLED",
            changed_by: "admin-delete-order",
          },
        });
      }

      await tx.order.delete({
        where: { id },
      });
    }, {
      isolationLevel: Prisma.TransactionIsolationLevel.Serializable,
    });

    return true;
  } catch (error) {
    const message = error instanceof Error ? error.message : "DELETE_FAILED";

    if (message === "ORDER_NOT_FOUND") {
      return { code: "PRODUCT_NOT_FOUND", message: "Order not found." };
    }

    return { code: "ORDER_CREATION_FAILED", message: "Unable to remove the order right now." };
  }
}
