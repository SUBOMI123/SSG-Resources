export interface CatalogProductCard {
  id: string;
  name: string;
  slug: string;
  sku: string;
  description: string | null;
  unit_price: number;
  available: number;
  isInStock: boolean;
}

export interface CatalogProductDetail extends CatalogProductCard {
  quantity_on_hand: number;
  reserved: number;
}
