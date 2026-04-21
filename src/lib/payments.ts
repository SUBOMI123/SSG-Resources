import { prisma } from "@/lib/db";

export type PaymentPeriod = "this-month" | "last-month" | "this-year" | "all" | "month";

export type PaymentRange = {
  period: PaymentPeriod;
  month: string | null;
};

export type PaymentMonthOption = {
  value: string;
  label: string;
};

export type PaymentOrderRow = {
  id: string;
  reference: string;
  customer_name: string;
  payment_status: "PENDING" | "PARTIAL" | "PAID" | "FAILED";
  fulfillment_status: "PENDING" | "CONFIRMED" | "DELIVERED";
  total: number;
  amount_paid: number;
  balance_due: number;
  created_at: Date;
  paid_at: Date | null;
};

export type PaymentDashboard = {
  filter: PaymentRange & {
    label: string;
  };
  totals: {
    orders: number;
    collected_amount: number;
    outstanding_amount: number;
    failed_amount: number;
  };
  buckets: {
    paid: PaymentOrderRow[];
    partial: PaymentOrderRow[];
    pending: PaymentOrderRow[];
    failed: PaymentOrderRow[];
  };
};

export type FinancialDashboard = {
  filter: PaymentRange & {
    label: string;
  };
  totals: {
    total_sales: number;
    collected_amount: number;
    outstanding_amount: number;
    failed_amount: number;
    average_order_value: number;
    paid_order_rate: number;
  };
  source_breakdown: {
    web_amount: number;
    manual_amount: number;
  };
  recent_orders: Array<PaymentOrderRow & { source: "WEB" | "MANUAL" }>;
};

function isValidMonthValue(value?: string | null): value is string {
  if (!value) return false;
  return /^\d{4}-(0[1-9]|1[0-2])$/.test(value);
}

export function parsePaymentPeriod(value?: string | null): PaymentPeriod {
  if (value === "this-month" || value === "last-month" || value === "this-year" || value === "all" || value === "month") {
    return value;
  }

  return "this-month";
}

export function parsePaymentRange(params?: { period?: string | null; month?: string | null }): PaymentRange {
  const period = parsePaymentPeriod(params?.period);
  const month = isValidMonthValue(params?.month) ? params?.month : null;

  if (period === "month") {
    return {
      period,
      month: month ?? formatMonthValue(new Date()),
    };
  }

  return {
    period,
    month: null,
  };
}

export function getPaymentPeriodLabel(range: PaymentRange) {
  if (range.period === "this-month") return "This month";
  if (range.period === "last-month") return "Last month";
  if (range.period === "this-year") return "This year";
  if (range.period === "month" && range.month) {
    return formatMonthLabel(range.month);
  }
  return "All time";
}

function formatMonthValue(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  return `${year}-${month}`;
}

function parseMonthValue(value: string) {
  const [year, month] = value.split("-").map(Number);
  return new Date(year, month - 1, 1);
}

function formatMonthLabel(value: string) {
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(parseMonthValue(value));
}

function getPeriodBounds(range: PaymentRange) {
  if (range.period === "all") {
    return null;
  }

  const now = new Date();

  if (range.period === "this-month") {
    return {
      gte: new Date(now.getFullYear(), now.getMonth(), 1),
      lt: new Date(now.getFullYear(), now.getMonth() + 1, 1),
    };
  }

  if (range.period === "last-month") {
    return {
      gte: new Date(now.getFullYear(), now.getMonth() - 1, 1),
      lt: new Date(now.getFullYear(), now.getMonth(), 1),
    };
  }

  if (range.period === "month" && range.month) {
    const start = parseMonthValue(range.month);

    return {
      gte: start,
      lt: new Date(start.getFullYear(), start.getMonth() + 1, 1),
    };
  }

  return {
    gte: new Date(now.getFullYear(), 0, 1),
    lt: new Date(now.getFullYear() + 1, 0, 1),
  };
}

export async function getPaymentMonthOptions(): Promise<PaymentMonthOption[]> {
  const [firstPayment, firstOrder] = await Promise.all([
    prisma.orderPayment.findFirst({
      orderBy: { received_at: "asc" },
      select: { received_at: true },
    }),
    prisma.order.findFirst({
      orderBy: { created_at: "asc" },
      select: { created_at: true },
    }),
  ]);

  const oldestDate =
    firstPayment && firstOrder
      ? firstPayment.received_at < firstOrder.created_at
        ? firstPayment.received_at
        : firstOrder.created_at
      : firstPayment?.received_at ?? firstOrder?.created_at ?? new Date();

  const currentMonth = new Date();
  const cursor = new Date(currentMonth.getFullYear(), currentMonth.getMonth(), 1);
  const oldestMonth = new Date(oldestDate.getFullYear(), oldestDate.getMonth(), 1);
  const options: PaymentMonthOption[] = [];

  while (cursor >= oldestMonth) {
    const value = formatMonthValue(cursor);
    options.push({
      value,
      label: formatMonthLabel(value),
    });
    cursor.setMonth(cursor.getMonth() - 1);
  }

  return options;
}

export async function getPaymentDashboard(filter: PaymentRange): Promise<PaymentDashboard> {
  const bounds = getPeriodBounds(filter);
  const orders = await prisma.order.findMany({
    where: bounds ? { created_at: bounds } : undefined,
    orderBy: [{ created_at: "desc" }],
    select: {
      id: true,
      reference: true,
      customer_name: true,
      payment_status: true,
      fulfillment_status: true,
      total: true,
      amount_paid: true,
      balance_due: true,
      created_at: true,
      paid_at: true,
    },
  });
  const payments = await prisma.orderPayment.aggregate({
    _sum: { amount: true },
    where: bounds ? { received_at: bounds } : undefined,
  });

  const rows: PaymentOrderRow[] = orders.map((order) => ({
    id: order.id,
    reference: order.reference,
    customer_name: order.customer_name,
    payment_status: order.payment_status,
    fulfillment_status: order.fulfillment_status,
    total: order.total,
    amount_paid: order.amount_paid,
    balance_due: order.balance_due,
    created_at: order.created_at,
    paid_at: order.paid_at,
  }));

  const paid = rows.filter((order) => order.payment_status === "PAID");
  const partial = rows.filter((order) => order.payment_status === "PARTIAL");
  const pending = rows.filter((order) => order.payment_status === "PENDING");
  const failed = rows.filter((order) => order.payment_status === "FAILED");

  return {
    filter: {
      ...filter,
      label: getPaymentPeriodLabel(filter),
    },
    totals: {
      orders: rows.length,
      collected_amount: payments._sum.amount ?? 0,
      outstanding_amount: rows.reduce((sum, order) => sum + order.balance_due, 0),
      failed_amount: failed.reduce((sum, order) => sum + order.total, 0),
    },
    buckets: {
      paid,
      partial,
      pending,
      failed,
    },
  };
}

export async function getFinancialDashboard(filter: PaymentRange): Promise<FinancialDashboard> {
  const bounds = getPeriodBounds(filter);
  const orders = await prisma.order.findMany({
    where: bounds ? { created_at: bounds } : undefined,
    orderBy: [{ created_at: "desc" }],
    select: {
      id: true,
      reference: true,
      customer_name: true,
      payment_status: true,
      fulfillment_status: true,
      source: true,
      total: true,
      amount_paid: true,
      balance_due: true,
      created_at: true,
      paid_at: true,
    },
  });
  const payments = await prisma.orderPayment.aggregate({
    _sum: { amount: true },
    where: bounds ? { received_at: bounds } : undefined,
  });

  const totalSales = orders.reduce((sum, order) => sum + order.total, 0);
  const collectedAmount = payments._sum.amount ?? 0;
  const outstandingAmount = orders.reduce((sum, order) => sum + order.balance_due, 0);
  const failedAmount = orders
    .filter((order) => order.payment_status === "FAILED")
    .reduce((sum, order) => sum + order.total, 0);
  const paidOrderCount = orders.filter((order) => order.payment_status === "PAID").length;

  return {
    filter: {
      ...filter,
      label: getPaymentPeriodLabel(filter),
    },
    totals: {
      total_sales: totalSales,
      collected_amount: collectedAmount,
      outstanding_amount: outstandingAmount,
      failed_amount: failedAmount,
      average_order_value: orders.length > 0 ? Math.round(totalSales / orders.length) : 0,
      paid_order_rate: orders.length > 0 ? paidOrderCount / orders.length : 0,
    },
    source_breakdown: {
      web_amount: orders
        .filter((order) => order.source === "WEB")
        .reduce((sum, order) => sum + order.total, 0),
      manual_amount: orders
        .filter((order) => order.source === "MANUAL")
        .reduce((sum, order) => sum + order.total, 0),
    },
    recent_orders: orders.slice(0, 8).map((order) => ({
      id: order.id,
      reference: order.reference,
      customer_name: order.customer_name,
      payment_status: order.payment_status,
      fulfillment_status: order.fulfillment_status,
      total: order.total,
      amount_paid: order.amount_paid,
      balance_due: order.balance_due,
      created_at: order.created_at,
      paid_at: order.paid_at,
      source: order.source,
    })),
  };
}
