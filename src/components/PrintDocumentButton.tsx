"use client";

export function PrintDocumentButton() {
  return (
    <button className="secondary-pill print-hidden" onClick={() => window.print()} type="button">
      Print / Save as PDF
    </button>
  );
}
