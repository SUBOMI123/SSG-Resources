import type { InventoryItem } from "@/types/inventory";

interface InventoryTableProps {
  items: InventoryItem[];
  onEdit: (item: InventoryItem) => void;
  onDelete: (item: InventoryItem) => void;
}

export function InventoryTable({ items, onEdit, onDelete }: InventoryTableProps) {
  return (
    <div className="card inventory-table-shell">
      <div className="inventory-table-scroll">
        <table className="inventory-table">
          <thead>
            <tr>
              {["SKU", "Product", "Price", "On Hand", "Reserved", "Available", "Action"].map(
                (label) => (
                  <th key={label} className={label === "Action" ? "inventory-cell-action" : undefined}>
                    {label}
                  </th>
                ),
              )}
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              const availableColor =
                item.available < 50 ? "inventory-low" : item.available < 100 ? "inventory-mid" : "inventory-good";

              return (
                <tr key={item.id}>
                  <td>
                    <code>{item.sku}</code>
                  </td>
                  <td>
                    <div className="inventory-product-cell">
                      <strong>{item.name}</strong>
                      <span>
                        {item.description ?? "No description"}
                      </span>
                    </div>
                  </td>
                  <td>₦{item.unit_price.toLocaleString()}</td>
                  <td>{item.quantity_on_hand}</td>
                  <td>{item.reserved}</td>
                  <td>
                    <span className={`inventory-availability ${availableColor}`}>{item.available}</span>
                  </td>
                  <td className="inventory-cell-action">
                    <div className="inventory-table-actions">
                      <button onClick={() => onEdit(item)} className="secondary-pill" type="button">
                        Update
                      </button>
                      <button onClick={() => onDelete(item)} className="danger-pill" type="button">
                        Remove
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      {items.length === 0 ? (
        <div className="inventory-empty">No inventory items found.</div>
      ) : null}
    </div>
  );
}
