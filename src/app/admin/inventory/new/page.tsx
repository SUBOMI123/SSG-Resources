import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { InventoryCreateForm } from "@/components/admin/InventoryCreateForm";

export default function AdminInventoryNewPage() {
  return (
    <>
      <AdminPageHeader
        eyebrow="Stock"
        title="Add product"
        description="Create a new product here so stock setup stays simple and separate from the overview page."
        secondaryAction={{ href: "/admin/inventory/list", label: "Back to stock list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/inventory", label: "Overview" },
          { href: "/admin/inventory/list", label: "Stock list" },
        ]}
      />
      <InventoryCreateForm />
    </>
  );
}
