import Link from "next/link";
import { notFound } from "next/navigation";

import { PrintDocumentButton } from "@/components/PrintDocumentButton";
import { WaybillDocument } from "@/components/WaybillDocument";
import { buildWaybillDocument } from "@/lib/documents";
import { getOrderByReference } from "@/lib/orders";

export const dynamic = "force-dynamic";

type WaybillPageProps = {
  params: Promise<{
    reference: string;
  }>;
};

export default async function WaybillPage({ params }: WaybillPageProps) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);

  if (!order) {
    notFound();
  }

  const document = buildWaybillDocument(order);

  return (
    <main className="shell storefront-shell document-shell">
      <div className="document-toolbar print-hidden">
        <Link className="text-link" href={`/orders/${order.reference}`}>
          Back to order
        </Link>
        <PrintDocumentButton />
      </div>
      <WaybillDocument document={document} />
    </main>
  );
}
