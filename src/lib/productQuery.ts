import type { ProductQuery } from "@/services/woocommerce";

export type SearchParamsMap = Record<string, string | string[] | undefined>;

function first(v: string | string[] | undefined): string | undefined {
  return Array.isArray(v) ? v[0] : v;
}

/** Translate URL search params into a WooCommerce product query. */
export function parseProductQuery(
  sp: SearchParamsMap,
  perPage = 20
): { query: ProductQuery; page: number; plain: Record<string, string | undefined> } {
  const page = Math.max(1, parseInt(first(sp.page) ?? "1", 10) || 1);
  const orderbyRaw = first(sp.orderby) ?? "date";

  let orderby: ProductQuery["orderby"] = "date";
  let order: ProductQuery["order"] = "desc";
  if (orderbyRaw === "price-asc") {
    orderby = "price";
    order = "asc";
  } else if (orderbyRaw === "price-desc") {
    orderby = "price";
    order = "desc";
  } else if (["date", "popularity", "rating", "title"].includes(orderbyRaw)) {
    orderby = orderbyRaw as ProductQuery["orderby"];
  }

  const price = first(sp.price);
  let minPrice: number | undefined;
  let maxPrice: number | undefined;
  if (price) {
    const [min, max] = price.split("-");
    minPrice = min ? parseInt(min, 10) : undefined;
    maxPrice = max ? parseInt(max, 10) : undefined;
  }

  const availability = first(sp.availability);
  const stockStatus =
    availability === "instock"
      ? ("instock" as const)
      : availability === "preorder"
        ? ("outofstock" as const)
        : undefined;

  const categoryId = parseInt(first(sp.category) ?? "", 10);

  const query: ProductQuery = {
    page,
    perPage,
    orderby,
    order,
    minPrice,
    maxPrice,
    stockStatus,
    onSale: first(sp.on_sale) === "true" || undefined,
    category: Number.isInteger(categoryId) ? categoryId : undefined,
    search: first(sp.q) || first(sp.search) || undefined,
  };

  const plain: Record<string, string | undefined> = {
    orderby: first(sp.orderby),
    price: first(sp.price),
    availability: first(sp.availability),
    on_sale: first(sp.on_sale),
    category: first(sp.category),
    q: first(sp.q),
  };

  return { query, page, plain };
}
