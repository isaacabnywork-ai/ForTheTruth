export type GiftCardStatus = "active" | "redeemed" | "expired" | "disabled";

export type GiftCardType = "purchased" | "complimentary" | "promotional" | "manual";

export type GiftCardTransactionType =
  | "issuance"
  | "redemption"
  | "refund"
  | "admin_credit"
  | "admin_debit"
  | "reversal";

export interface GiftCardDesign {
  id: string;
  title: string;
  subtitle: string;
  description: string;
  image: string;
  bgColor: string;
  enabled: boolean;
}

export interface EmailDeliveryRecord {
  sentAt: string;
  recipientEmail: string;
  status: "sent" | "failed";
  error?: string;
}

export interface GiftCard {
  id: string;
  code: string;
  codeHash: string;
  designId: string;
  designTitle: string;
  designImage: string;
  initialAmount: number;
  remainingBalance: number;
  currency: "INR";
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  status: GiftCardStatus;
  type: GiftCardType;
  orderId?: number;
  expiryDate: string | null; // ISO string, or null for no expiry
  createdAt: string;
  updatedAt: string;
  lastUsedAt?: string;
  emailDeliveryStatus: "pending" | "sent" | "failed";
  emailHistory: EmailDeliveryRecord[];
  notes?: string;
}

export interface GiftCardOverview {
  totalIssued: number;
  totalValueIssued: number;
  totalRedeemedValue: number;
  outstandingBalance: number;
  activeCount: number;
  expiredCount: number;
  redeemedCount: number;
  disabledCount: number;
  recentCards: GiftCard[];
  recentTransactions: GiftCardTransaction[];
  monthlySales: Array<{ month: string; sales: number; redemptions: number }>;
}

export interface GiftCardTransaction {
  id: string;
  giftCardId: string;
  giftCardCodeMasked: string;
  type: GiftCardTransactionType;
  amount: number;
  balanceBefore: number;
  balanceAfter: number;
  orderId?: number;
  note?: string;
  performedBy?: string;
  createdAt: string;
}

export interface GiftCardSettings {
  enabled: boolean;
  minAmount: number;
  maxAmount: number;
  defaultValidityDays: number;
  allowMultiplePerOrder: boolean;
  allowPartialRedemption: boolean;
  allowGuestRedemption: boolean;
  senderName: string;
  senderEmail: string;
  designs: GiftCardDesign[];
}

export const DEFAULT_GIFT_CARD_DESIGNS: GiftCardDesign[] = [
  {
    id: "classic-gift-card",
    title: "Classic Gift Card",
    subtitle: "Stacked Books & Ribbon",
    description: "Our signature bookstore gift card adorned with a stacked pile of classic Christian books wrapped in a bright yellow ribbon.",
    image: "/images/gift-cards/classic-gift-card.webp",
    bgColor: "#FFFBF0",
    enabled: true,
  },
  {
    id: "gift-exchange",
    title: "Gift Exchange",
    subtitle: "Hands Exchanging Present",
    description: "A joyful and vibrant design celebrating the fellowship and delight of giving thoughtful books to one another.",
    image: "/images/gift-cards/gift-exchange.webp",
    bgColor: "#FFD028",
    enabled: true,
  },
  {
    id: "faith-journey",
    title: "Faith Journey",
    subtitle: "A Gift of Books for Your Walk",
    description: "An uplifting, warm pink illustration of an open Bible with the cross, encouraging spiritual depth and biblical discernment.",
    image: "/images/gift-cards/faith-journey.webp",
    bgColor: "#FFDFE5",
    enabled: true,
  },
  {
    id: "birthday-gift-card",
    title: "Birthday Gift Card",
    subtitle: "Celebration Cake & Candle",
    description: "A cheerful sky-blue design with a frosted birthday cake and shining candle to bless someone on their special day.",
    image: "/images/gift-cards/birthday-gift-card.webp",
    bgColor: "#8FE0FF",
    enabled: true,
  },
  {
    id: "christmas-gift-card",
    title: "Merry Christmas Gift Card",
    subtitle: "Christmas Tree & Gifts",
    description: "A cozy lavender card with a Christmas tree and gifts celebrating the incarnation of Christ and giving the gift of sound literature.",
    image: "/images/gift-cards/christmas-gift-card.webp",
    bgColor: "#DDD1F5",
    enabled: true,
  },
  {
    id: "thank-you-gift-card",
    title: "Thank You Gift Card",
    subtitle: "Envelope & Heart",
    description: "A fresh mint-green design with a love-filled envelope expressing deep appreciation to pastors, mentors, family, and friends.",
    image: "/images/gift-cards/thank-you-gift-card.webp",
    bgColor: "#D5F5E3",
    enabled: true,
  },
];

export const DEFAULT_GIFT_CARD_SETTINGS: GiftCardSettings = {
  enabled: true,
  minAmount: 100,
  maxAmount: 10000,
  defaultValidityDays: 365,
  allowMultiplePerOrder: true,
  allowPartialRedemption: true,
  allowGuestRedemption: true,
  senderName: "For The Truth",
  senderEmail: "contact@forthetruth.in",
  designs: DEFAULT_GIFT_CARD_DESIGNS,
};
