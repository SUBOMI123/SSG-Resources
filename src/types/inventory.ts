export type InventoryChangeReason =
  | "MANUAL_UPDATE"
  | "ORDER_PLACED"
  | "ORDER_CANCELLED";

export interface InventoryItem {
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
}

export interface InventoryUpdateRequest {
  product_id: string;
  new_quantity: number;
  reason: InventoryChangeReason;
  changed_by: string;
}

export interface InventoryCreateRequest {
  name: string;
  sku: string;
  slug: string;
  description?: string | null;
  unit_price: number;
  quantity_on_hand: number;
  changed_by: string;
}

export interface InventoryUpdateResponse {
  success: boolean;
  product: InventoryItem;
  previous_quantity: number;
  change_amount: number;
  history_id: string;
}

export interface ReserveInventoryRequest {
  product_id: string;
  quantity: number;
  reason: string;
}

export interface InventoryError {
  code:
    | "INSUFFICIENT_STOCK"
    | "PRODUCT_NOT_FOUND"
    | "PRODUCT_ALREADY_EXISTS"
    | "PRODUCT_IN_USE"
    | "INVALID_QUANTITY"
    | "TRANSACTION_FAILED";
  message: string;
}
