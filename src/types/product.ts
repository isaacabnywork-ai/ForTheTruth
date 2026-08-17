/** Subset of the WooCommerce REST API v3 product schema used by the app. */
export interface WCImage {
  id: number;
  src: string;
  alt: string;
}

export interface WCCategory {
  id: number;
  name: string;
  slug: string;
  description?: string;
  image?: WCImage | null;
  count?: number;
}

export interface WCAttribute {
  id: number;
  name: string;
  options: string[];
}

export interface Product {
  id: number;
  name: string;
  slug: string;
  permalink: string;
  description: string;
  short_description: string;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  on_sale: boolean;
  stock_status: "instock" | "outofstock" | "onbackorder";
  stock_quantity: number | null;
  average_rating: string;
  rating_count: number;
  images: WCImage[];
  categories: Pick<WCCategory, "id" | "name" | "slug">[];
  attributes: WCAttribute[];
  weight?: string;
  dimensions?: {
    length: string;
    width: string;
    height: string;
  };
}

export interface ProductReview {
  id: number;
  product_id: number;
  reviewer: string;
  review: string;
  rating: number;
  date_created: string;
  verified: boolean;
}

/** Convenience accessor: WooCommerce stores author as an attribute or meta. */
export function getAuthor(product: Product): string | undefined {
  return product.attributes.find((a) => a.name.toLowerCase() === "author")
    ?.options[0];
}
