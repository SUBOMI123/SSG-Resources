import { formatDocumentDate, type WaybillDocument as WaybillDocumentModel } from "@/lib/documents";

interface WaybillDocumentProps {
  document: WaybillDocumentModel;
}

export function WaybillDocument({ document }: WaybillDocumentProps) {
  return (
    <article className="card document-sheet">
      <div className="document-head">
        <div>
          <p className="eyebrow">Waybill</p>
          <h1 className="document-title">{document.document_number}</h1>
          <p className="document-copy">Order reference: {document.order_reference}</p>
        </div>
        <div className="document-meta">
          <strong>{document.business.name}</strong>
          <span>{document.business.address}</span>
          <span>{document.business.support_phone}</span>
        </div>
      </div>

      <div className="document-grid">
        <section>
          <p className="eyebrow">Deliver to</p>
          <strong>{document.customer.name}</strong>
          <p className="document-copy">{document.customer.phone}</p>
          <p className="document-copy">{document.customer.address}</p>
        </section>
        <section>
          <p className="eyebrow">Dispatch</p>
          <p className="document-copy">Created: {formatDocumentDate(document.issued_at)}</p>
          <p className="document-copy">Handled by: {document.assigned_to ?? "Not set yet"}</p>
          <p className="document-copy">Reference: {document.order_reference}</p>
        </section>
      </div>

      <div className="document-lines">
        <div className="document-line document-line-head">
          <span>Item</span>
          <span>SKU</span>
          <span>Qty</span>
          <span>Check</span>
        </div>
        {document.items.map((item) => (
          <div className="document-line" key={`${document.document_number}-${item.product_slug}`}>
            <span>{item.product_name}</span>
            <span>{item.product_sku}</span>
            <span>{item.quantity}</span>
            <strong>_______</strong>
          </div>
        ))}
      </div>

      <div className="document-note">
        <p className="eyebrow">Delivery instructions</p>
        <p className="document-copy">{document.delivery_instructions ?? "Handle according to customer request."}</p>
      </div>
    </article>
  );
}
