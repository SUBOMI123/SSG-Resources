"use client";

import { useState } from "react";

import type {
  CheckoutLineInput,
  ManualOrderParseResponse,
  ManualOrderProductOption,
  ParsedManualOrderLine,
} from "@/types/order";

interface ManualOrderParserProps {
  products: ManualOrderProductOption[];
  onApply: (items: CheckoutLineInput[], rawText: string) => void;
}

export function ManualOrderParser({ products, onApply }: ManualOrderParserProps) {
  const [rawText, setRawText] = useState("");
  const [result, setResult] = useState<ManualOrderParseResponse | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleParse() {
    setSaving(true);
    setError(null);

    try {
      const response = await fetch("/api/admin/orders/parse", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ raw_text: rawText }),
      });

      const data = (await response.json()) as ManualOrderParseResponse & { error?: string };
      if (!response.ok) {
        throw new Error(data.error ?? "Failed to parse order text.");
      }

      setResult(data);
    } catch (parseError) {
      setError(parseError instanceof Error ? parseError.message : "Failed to parse order text.");
    } finally {
      setSaving(false);
    }
  }

  function updateLine(index: number, next: ParsedManualOrderLine) {
    setResult((current) => {
      if (!current) {
        return current;
      }

      const lines = current.lines.map((line, lineIndex) => (lineIndex === index ? next : line));
      const items = collapseLines(lines);
      const warnings = lines
        .filter((line) => line.status !== "matched")
        .map((line) => `${line.raw_line}: ${line.note}`);

      return { ...current, lines, items, warnings };
    });
  }

  return (
    <section className="card order-admin-panel">
      <p className="eyebrow">Paste and review</p>
      <div className="manual-parser-head">
        <div>
          <h2 className="section-title" style={{ fontSize: "2rem" }}>
            Order text helper
          </h2>
          <p className="section-copy">
            Paste order notes from WhatsApp, phone calls, or email. Check the suggested product matches before saving the order.
          </p>
        </div>
        <button className="secondary-pill" disabled={saving} onClick={handleParse} type="button">
          {saving ? "Parsing..." : "Parse text"}
        </button>
      </div>

      <label className="checkout-field">
        <span>Raw order text</span>
        <textarea
          placeholder={"2mm P 15\nPrimer 2\n3m mineral 4"}
          rows={6}
          value={rawText}
          onChange={(event) => setRawText(event.target.value)}
        />
      </label>

      {error ? <p className="checkout-error">{error}</p> : null}

      {result ? (
        <div className="manual-parser-results">
          <div className="manual-parser-summary">
            <strong>{result.items.length} product line(s) ready</strong>
            {result.warnings.length > 0 ? (
              <p className="checkout-error">{result.warnings.join(" ")}</p>
            ) : (
              <p className="order-meta">All parsed lines matched cleanly.</p>
            )}
          </div>

          <div className="manual-parser-lines">
            {result.lines.map((line, index) => (
              <article key={`${line.raw_line}-${index}`} className="manual-parser-line">
                <div>
                  <strong>{line.raw_line}</strong>
                  <p className="order-meta">{line.note}</p>
                </div>

                <div className="manual-parser-grid">
                  <label className="checkout-field">
                    <span>Product</span>
                    <select
                      value={line.product_slug ?? ""}
                      onChange={(event) => {
                        const selected = products.find((product) => product.slug === event.target.value) ?? null;
                        updateLine(index, {
                          ...line,
                          product_slug: selected?.slug ?? null,
                          product_name: selected?.name ?? null,
                          status: selected ? "matched" : "unmatched",
                          note: selected
                            ? "Selection updated manually."
                            : "No product selected for this line.",
                        });
                      }}
                    >
                      <option value="">Select a product</option>
                      {line.candidates.length > 0
                        ? line.candidates.map((candidate) => (
                            <option key={candidate.slug} value={candidate.slug}>
                              {candidate.name} ({candidate.sku})
                            </option>
                          ))
                        : null}
                      {products
                        .filter((product) => !line.candidates.some((candidate) => candidate.slug === product.slug))
                        .map((product) => (
                          <option key={product.slug} value={product.slug}>
                            {product.name} ({product.sku})
                          </option>
                        ))}
                    </select>
                  </label>

                  <label className="checkout-field">
                    <span>Quantity</span>
                    <input
                      min="1"
                      type="number"
                      value={String(line.quantity)}
                      onChange={(event) =>
                        updateLine(index, {
                          ...line,
                          quantity: Math.max(Number(event.target.value || "1"), 1),
                        })
                      }
                    />
                  </label>
                </div>
              </article>
            ))}
          </div>

          <div className="checkout-actions">
            <button
              className="primary-pill"
              type="button"
              onClick={() => onApply(result.items, rawText)}
              disabled={result.items.length === 0}
            >
              Apply parsed items
            </button>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function collapseLines(lines: ParsedManualOrderLine[]): CheckoutLineInput[] {
  const grouped = new Map<string, number>();

  for (const line of lines) {
    if (!line.product_slug || line.quantity <= 0) {
      continue;
    }

    grouped.set(line.product_slug, (grouped.get(line.product_slug) ?? 0) + line.quantity);
  }

  return Array.from(grouped.entries()).map(([product_slug, quantity]) => ({
    product_slug,
    quantity,
  }));
}
