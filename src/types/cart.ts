export interface CartItem {
  productId: number;
  slug: string;
  name: string;
  /** Unit price snapshot for display only — real totals are recomputed server-side at checkout. */
  price: number;
  image?: string;
  quantity: number;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  displayName?: string;
  avatarUrl?: string;
  role?: string;
}
