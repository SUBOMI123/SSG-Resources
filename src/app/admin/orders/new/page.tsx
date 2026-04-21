import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { OrderCreateWorkspace } from "@/components/admin/OrderCreateWorkspace";

export default function AdminOrdersNewPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Orders"
        title="Add order"
        description="Create a manual order here. If the customer sent the order by text or WhatsApp, use the parser first."
        secondaryAction={{ href: "/admin/orders/list", label: "Back to order list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/orders", label: "Overview" },
          { href: "/admin/orders/list", label: "Order list" },
        ]}
      />
      <OrderCreateWorkspace />
    </>
  );
}
