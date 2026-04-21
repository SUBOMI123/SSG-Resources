import Link from "next/link";
import { notFound } from "next/navigation";

import { InvoiceDocument } from "@/components/InvoiceDocument";
import { PrintDocumentButton } from "@/components/PrintDocumentButton";
import { buildInvoiceDocument } from "@/lib/documents";
import { getOrderByReference } from "@/lib/orders";

export const dynamic = "force-dynamic";

type InvoicePageProps = {
  params: Promise<{
    reference: string;
  }>;
};

export default async function InvoicePage({ params }: InvoicePageProps) {
  const { reference } = await params;
  const order = await getOrderByReference(reference);

  if (!order) {
    notFound();
  }

  const document = buildInvoiceDocument(order);

  return (
    <main className="shell storefront-shell document-shell">
      <div className="document-toolbar print-hidden">
        <Link className="text-link" href={`/orders/${order.reference}`}>
          Back to order
        </Link>
        <PrintDocumentButton />
      </div>
      <InvoiceDocument document={document} />
    </main>
  );
}
