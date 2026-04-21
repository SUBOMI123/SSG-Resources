import type {
  CheckoutLineInput,
  ManualOrderParseResponse,
  ManualOrderProductOption,
  ParsedManualOrderCandidate,
  ParsedManualOrderLine,
} from "@/types/order";

function normalizeText(value: string) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();
}

function tokenize(value: string) {
  return normalizeText(value).split(/\s+/).filter(Boolean);
}

function extractQuantity(line: string) {
  const numericMatches = [...line.matchAll(/(\d+)/g)];
  if (numericMatches.length === 0) {
    return 1;
  }

  const trailing = Number(numericMatches[numericMatches.length - 1]?.[1] ?? "1");
  return Number.isInteger(trailing) && trailing > 0 ? trailing : 1;
}

function removeQuantityTokens(tokens: string[]) {
  return tokens.filter((token) => !/^\d+$/.test(token));
}

function buildAliasTokens(product: ManualOrderProductOption) {
  const combined = `${product.name} ${product.sku} ${product.slug}`;
  return Array.from(new Set(tokenize(combined)));
}

function scoreProductMatch(lineTokens: string[], product: ManualOrderProductOption) {
  const aliasTokens = buildAliasTokens(product);
  let score = 0;

  for (const token of lineTokens) {
    if (aliasTokens.includes(token)) {
      score += token.length >= 3 ? 3 : 1;
    }
  }

  const normalizedLine = lineTokens.join(" ");
  const normalizedName = normalizeText(product.name);
  const normalizedSku = normalizeText(product.sku);
  const normalizedSlug = normalizeText(product.slug);

  if (normalizedLine.includes(normalizedName)) {
    score += 6;
  }
  if (normalizedLine.includes(normalizedSku)) {
    score += 5;
  }
  if (normalizedLine.includes(normalizedSlug)) {
    score += 4;
  }

  return score;
}

function toCandidate(product: ManualOrderProductOption): ParsedManualOrderCandidate {
  return {
    slug: product.slug,
    name: product.name,
    sku: product.sku,
    available: product.available,
  };
}

function buildParsedLine(
  rawLine: string,
  products: ManualOrderProductOption[],
): ParsedManualOrderLine {
  const quantity = extractQuantity(rawLine);
  const lineTokens = removeQuantityTokens(tokenize(rawLine));

  if (lineTokens.length === 0) {
    return {
      raw_line: rawLine,
      quantity,
      product_slug: null,
      product_name: null,
      status: "unmatched",
      note: "No recognizable product terms found on this line.",
      candidates: [],
    };
  }

  const scored = products
    .map((product) => ({
      product,
      score: scoreProductMatch(lineTokens, product),
    }))
    .filter((entry) => entry.score > 0)
    .sort((left, right) => right.score - left.score || left.product.name.localeCompare(right.product.name));

  if (scored.length === 0) {
    return {
      raw_line: rawLine,
      quantity,
      product_slug: null,
      product_name: null,
      status: "unmatched",
      note: "No product match found. Choose a product manually if this line is valid.",
      candidates: [],
    };
  }

  const [best, second] = scored;
  const topCandidates = scored.slice(0, 3).map((entry) => toCandidate(entry.product));

  if (second && best.score - second.score <= 1) {
    return {
      raw_line: rawLine,
      quantity,
      product_slug: best.product.slug,
      product_name: best.product.name,
      status: "ambiguous",
      note: "Multiple products looked similar. Review this match before saving.",
      candidates: topCandidates,
    };
  }

  return {
    raw_line: rawLine,
    quantity,
    product_slug: best.product.slug,
    product_name: best.product.name,
    status: "matched",
    note: best.product.available < quantity
      ? "Matched product but requested quantity exceeds currently available stock."
      : "Matched automatically.",
    candidates: topCandidates,
  };
}

function collapseParsedItems(lines: ParsedManualOrderLine[]): CheckoutLineInput[] {
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

export function parseManualOrderText(
  rawText: string,
  products: ManualOrderProductOption[],
): ManualOrderParseResponse {
  const lines = rawText
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => buildParsedLine(line, products));

  const warnings = lines
    .filter((line) => line.status !== "matched" || line.note.includes("exceeds"))
    .map((line) => `${line.raw_line}: ${line.note}`);

  return {
    lines,
    items: collapseParsedItems(lines),
    warnings,
  };
}
