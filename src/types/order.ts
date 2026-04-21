export type PaymentStatus = "PENDING" | "PARTIAL" | "PAID" | "FAILED";
export type FulfillmentStatus = "PENDING" | "CONFIRMED" | "DELIVERED";
export type OrderSource = "WEB" | "MANUAL";

export interface OrderPaymentRecord {
  id: string;
  amount: number;
  note: string | null;
  recorded_by: string;
  received_at: Date;
  created_at: Date;
}

export interface CheckoutLineInput {
  product_slug: string;
  quantity: number;
}

export interface CheckoutCustomerInput {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  notes?: string;
}

export interface CheckoutRequest extends CheckoutCustomerInput {
  items: CheckoutLineInput[];
}

export interface CheckoutOrderLine {
  product_id: string;
  product_name: string;
  product_sku: string;
  product_slug: string;
  unit_price: number;
  quantity: number;
  line_total: number;
}

export interface CheckoutOrderSummary {
  reference: string;
  source?: OrderSource;
  assigned_to?: string | null;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  total: number;
  amount_paid: number;
  balance_due: number;
  items: CheckoutOrderLine[];
}

export interface CheckoutResponse {
  success: boolean;
  order: CheckoutOrderSummary;
  payment_init:
    | {
        provider: "whatsapp";
        status: "pending_contact";
        contact_url: string;
        contact_label: string;
      }
    | {
        provider: "paystack";
        status: "pending_initialization" | "ready" | "config_missing";
        authorization_url?: string;
        access_code?: string;
      };
}

export interface OrderPublicSummary {
  id: string;
  reference: string;
  source?: OrderSource;
  assigned_to?: string | null;
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  delivery_address: string;
  payment_status: PaymentStatus;
  fulfillment_status: FulfillmentStatus;
  total: number;
  amount_paid: number;
  balance_due: number;
  items: CheckoutOrderLine[];
  payments: OrderPaymentRecord[];
  payment_url: string | null;
  created_at: Date;
}

export interface ManualOrderRequest extends CheckoutCustomerInput {
  product_slug?: string;
  quantity?: number;
  assigned_to?: string;
  items?: CheckoutLineInput[];
}

export interface AdminOrderListItem extends OrderPublicSummary {
  id: string;
}

export interface AdminOrderUpdateRequest {
  assigned_to?: string | null;
  fulfillment_status?: FulfillmentStatus;
  payment_status?: PaymentStatus;
}

export interface OrderPaymentCreateRequest {
  amount: number;
  note?: string;
}

export interface ManualOrderProductOption {
  id: string;
  name: string;
  slug: string;
  sku: string;
  available: number;
}

export interface ParsedManualOrderCandidate {
  slug: string;
  name: string;
  sku: string;
  available: number;
}

export interface ParsedManualOrderLine {
  raw_line: string;
  quantity: number;
  product_slug: string | null;
  product_name: string | null;
  status: "matched" | "ambiguous" | "unmatched";
  note: string;
  candidates: ParsedManualOrderCandidate[];
}

export interface ManualOrderParseResponse {
  lines: ParsedManualOrderLine[];
  items: CheckoutLineInput[];
  warnings: string[];
}

export interface CheckoutError {
  code:
    | "INVALID_REQUEST"
    | "PRODUCT_NOT_FOUND"
    | "INVALID_QUANTITY"
    | "INSUFFICIENT_STOCK"
    | "ORDER_CREATION_FAILED";
  message: string;
}

export interface PaystackInitializeResponse {
  status: true;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

export interface PaystackVerifyResponse {
  status: true;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    paid_at?: string;
    customer?: {
      email?: string;
    };
  };
}
