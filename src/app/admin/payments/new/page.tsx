import { AdminPageHeader } from "@/components/admin/AdminPageHeader";
import { AdminSectionTabs } from "@/components/admin/AdminSectionTabs";
import { PaymentRecordForm } from "@/components/admin/PaymentRecordForm";
import { prisma } from "@/lib/db";

export const dynamic = "force-dynamic";

export default async function AdminPaymentsNewPage() {
  const orders = await prisma.order.findMany({
    where: {
      balance_due: {
        gt: 0,
      },
    },
    orderBy: [{ created_at: "desc" }],
    select: {
      id: true,
      reference: true,
      customer_name: true,
      balance_due: true,
    },
  });

  return (
    <>
      <AdminPageHeader
        eyebrow="Payments"
        title="Record payment"
        description="Save money received here so staff can focus only on payment updates without opening the full order page."
        secondaryAction={{ href: "/admin/payments/list", label: "Back to payment list", tone: "secondary" }}
      />
      <AdminSectionTabs
        tabs={[
          { href: "/admin/payments", label: "Overview" },
          { href: "/admin/payments/list", label: "Payment list" },
        ]}
      />
      <PaymentRecordForm orders={orders} />
    </>
  );
}
