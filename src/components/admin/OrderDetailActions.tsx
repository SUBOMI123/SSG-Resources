"use client";

import { useRouter } from "next/navigation";

import { OrderStatusEditor } from "@/components/OrderStatusEditor";
import type { AdminOrderListItem } from "@/types/order";

interface OrderDetailActionsProps {
  order: AdminOrderListItem;
}

export function OrderDetailActions({ order }: OrderDetailActionsProps) {
  const router = useRouter();

  async function handleSaved(action?: "saved" | "deleted") {
    if (action === "deleted") {
      router.push("/admin/orders/list");
      router.refresh();
      return;
    }

    router.refresh();
  }

  return <OrderStatusEditor order={order} onSaved={handleSaved} />;
}
