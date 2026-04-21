import { formatCurrency, formatDocumentDate, type InvoiceDocument as InvoiceDocumentModel } from "@/lib/documents";

interface InvoiceDocumentProps {
  document: InvoiceDocumentModel;
}

export function InvoiceDocument({ document }: InvoiceDocumentProps) {
  const paymentLabel =
    document.payment_status === "PENDING"
      ? "Waiting"
      : document.payment_status === "PARTIAL"
        ? "Part paid"
        : document.payment_status === "PAID"
          ? "Paid"
          : "Problem";
  const fulfillmentLabel =
    document.fulfillment_status === "PENDING"
      ? "New"
      : document.fulfillment_status === "CONFIRMED"
        ? "Confirmed"
        : "Delivered";

  return (
    <article className="card document-sheet">
      <div className="document-head">
        <div>
          <p className="eyebrow">Invoice</p>
          <h1 className="document-title">{document.document_number}</h1>
          <p className="document-copy">Order reference: {document.order_reference}</p>
        </div>
        <div className="document-meta">
          <strong>{document.business.name}</strong>
          <span>{document.business.address}</span>
          <span>{document.business.support_email}</span>
          <span>{document.business.support_phone}</span>
        </div>
      </div>

      <div className="document-grid">
        <section>
          <p className="eyebrow">Bill to</p>
          <strong>{document.customer.name}</strong>
          <p className="document-copy">{document.customer.email}</p>
          <p className="document-copy">{document.customer.phone}</p>
          <p className="document-copy">{document.customer.address}</p>
        </section>
        <section>
          <p className="eyebrow">Status</p>
          <p className="document-copy">Issued: {formatDocumentDate(document.issued_at)}</p>
          <p className="document-copy">Payment: {paymentLabel}</p>
          <p className="document-copy">Fulfillment: {fulfillmentLabel}</p>
        </section>
      </div>

      <div className="document-lines">
        <div className="document-line document-line-head">
          <span>Item</span>
          <span>Qty</span>
          <span>Unit</span>
          <span>Total</span>
        </div>
        {document.items.map((item) => (
          <div className="document-line" key={`${document.document_number}-${item.product_slug}`}>
            <span>{item.product_name}</span>
            <span>{item.quantity}</span>
            <span>{formatCurrency(item.unit_price)}</span>
            <strong>{formatCurrency(item.line_total)}</strong>
          </div>
        ))}
      </div>

      <div className="document-totals">
        <div>
          <span>Subtotal</span>
          <strong>{formatCurrency(document.subtotal)}</strong>
        </div>
        <div>
          <span>Total</span>
          <strong>{formatCurrency(document.total)}</strong>
        </div>
        <div>
          <span>Amount paid</span>
          <strong>{formatCurrency(document.amount_paid)}</strong>
        </div>
        <div>
          <span>Balance left</span>
          <strong>{formatCurrency(document.balance_due)}</strong>
        </div>
      </div>

      {document.notes ? (
        <div className="document-note">
          <p className="eyebrow">Notes</p>
          <p className="document-copy">{document.notes}</p>
        </div>
      ) : null}
    </article>
  );
}
