export interface GiftCardCartDetails {
  designId: string;
  designTitle: string;
  designName?: string;
  designImage: string;
  artworkUrl?: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  amount?: number;
  deliveryDate?: string;
}

export interface CartItem {
  productId: number;
  slug?: string;
  name: string;
  /** Unit price snapshot for display only — real totals are recomputed server-side at checkout. */
  price: number;
  image?: string;
  quantity: number;
  isVirtual?: boolean;
  weight?: number; // in kilograms
  giftCardDetails?: GiftCardCartDetails;
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
