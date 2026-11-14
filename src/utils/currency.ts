const formatter = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  maximumFractionDigits: 0,
});

const formatter2Decimals = new Intl.NumberFormat("en-IN", {
  style: "currency",
  currency: "INR",
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
});

export function formatPrice(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num)) return "—";
  return formatter.format(num);
}

export function formatPrice2Decimals(value: number | string): string {
  const num = typeof value === "string" ? parseFloat(value) : value;
  if (Number.isNaN(num) || num == null) return "—";
  return formatter2Decimals.format(num);
}

export function splitPrice(value: number | string): { symbol: string; amount: string } {
  const formatted = formatPrice(value);
  if (formatted === "—") return { symbol: "₹", amount: "—" };
  const symbol = formatted.match(/^\D+/)?.[0] || "₹";
  const amount = formatted.replace(/^\D+/, "");
  return { symbol, amount };
}
