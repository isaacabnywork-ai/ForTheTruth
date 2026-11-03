import fs from "fs";
import path from "path";
import crypto from "crypto";
import {
  GiftCard,
  GiftCardSettings,
  GiftCardTransaction,
  DEFAULT_GIFT_CARD_SETTINGS,
  EmailDeliveryRecord,
  GiftCardStatus,
} from "@/types/giftCard";

interface GiftCardsStore {
  cards: GiftCard[];
  transactions: GiftCardTransaction[];
  settings: GiftCardSettings;
  version: number;
  lastUpdated: string;
}

const STORE_FILE_PATH = path.join(process.cwd(), "src", "data", "gift_cards_store.json");
const TMP_STORE_PATH = path.join("/tmp", "ftt_gift_cards_store.json");

// Non-ambiguous character set for secure gift card codes (excludes 0, O, 1, I, L)
const CODE_CHARSET = "23456789ABCDEFGHJKMNPQRSTUVWXYZ";

/**
 * Generates a cryptographically secure random gift card code
 * Format: FTT-XXXX-XXXX-XXXX (e.g. FTT-K7M2-9P4X-W3A8)
 */
export function generateGiftCardCode(): string {
  const parts: string[] = ["FTT"];
  for (let p = 0; p < 3; p++) {
    const bytes = crypto.randomBytes(4);
    let chunk = "";
    for (let i = 0; i < 4; i++) {
      chunk += CODE_CHARSET[bytes[i] % CODE_CHARSET.length];
    }
    parts.push(chunk);
  }
  return parts.join("-");
}

/**
 * Computes a SHA-256 hash of a normalized gift card code.
 */
export function hashGiftCardCode(rawCode: string): string {
  const normalized = rawCode.replace(/[\s-]/g, "").toUpperCase();
  return crypto.createHash("sha256").update(normalized).digest("hex");
}

/**
 * Masks a gift card code for safe display in table views (e.g. FTT-••••-••••-W3A8)
 */
export function maskGiftCardCode(code: string): string {
  const parts = code.trim().split("-");
  if (parts.length === 4) {
    return `${parts[0]}-••••-••••-${parts[3]}`;
  }
  if (code.length > 8) {
    return `${code.slice(0, 4)}••••${code.slice(-4)}`;
  }
  return "••••••••";
}

// In-memory cache
const globalForGiftCards = globalThis as unknown as {
  _fttGiftCardsStore?: GiftCardsStore;
};

function getInitialStore(): GiftCardsStore {
  return {
    cards: [],
    transactions: [],
    settings: DEFAULT_GIFT_CARD_SETTINGS,
    version: 1,
    lastUpdated: new Date().toISOString(),
  };
}

let lastStoreMtime = 0;

/**
 * Loads the gift card store from disk into memory with atomic fallback.
 */
function loadStore(): GiftCardsStore {
  // 1. Try bundled source file on disk
  try {
    if (fs.existsSync(STORE_FILE_PATH)) {
      const stat = fs.statSync(STORE_FILE_PATH);
      if (
        !globalForGiftCards._fttGiftCardsStore ||
        stat.mtimeMs !== lastStoreMtime
      ) {
        const content = fs.readFileSync(STORE_FILE_PATH, "utf-8");
        const parsed = JSON.parse(content) as GiftCardsStore;
        if (parsed && Array.isArray(parsed.cards)) {
          lastStoreMtime = stat.mtimeMs;
          globalForGiftCards._fttGiftCardsStore = parsed;
          return parsed;
        }
      } else {
        return globalForGiftCards._fttGiftCardsStore;
      }
    }
  } catch (err) {
    console.warn("Failed to load store from bundled path:", err);
  }

  // 2. Try in-memory cache if file read not needed
  if (globalForGiftCards._fttGiftCardsStore) {
    return globalForGiftCards._fttGiftCardsStore;
  }

  // 2. Try /tmp path
  try {
    if (fs.existsSync(TMP_STORE_PATH)) {
      const content = fs.readFileSync(TMP_STORE_PATH, "utf-8");
      const parsed = JSON.parse(content) as GiftCardsStore;
      if (parsed && Array.isArray(parsed.cards)) {
        globalForGiftCards._fttGiftCardsStore = parsed;
        return parsed;
      }
    }
  } catch {}

  const initial = getInitialStore();
  globalForGiftCards._fttGiftCardsStore = initial;
  saveStore(initial);
  return initial;
}

/**
 * Persists the gift card store atomically.
 */
function saveStore(store: GiftCardsStore): void {
  store.lastUpdated = new Date().toISOString();
  globalForGiftCards._fttGiftCardsStore = store;

  const data = JSON.stringify(store, null, 2);

  // 1. Save to bundled source path if writable (Local development)
  try {
    const dir = path.dirname(STORE_FILE_PATH);
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }
    const tempFile = `${STORE_FILE_PATH}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, data, "utf-8");
    fs.renameSync(tempFile, STORE_FILE_PATH);
  } catch {
    // Read-only filesystem in some server environments
  }

  // 2. Always save to /tmp
  try {
    const tempFile = `${TMP_STORE_PATH}.${Date.now()}.tmp`;
    fs.writeFileSync(tempFile, data, "utf-8");
    fs.renameSync(tempFile, TMP_STORE_PATH);
  } catch (err) {
    console.warn("Failed to write to /tmp store:", err);
  }
}

/**
 * Returns the current gift card settings.
 */
export async function getGiftCardSettings(): Promise<GiftCardSettings> {
  const store = loadStore();
  return store.settings || DEFAULT_GIFT_CARD_SETTINGS;
}

/**
 * Updates gift card settings.
 */
export async function updateGiftCardSettings(
  updates: Partial<GiftCardSettings>
): Promise<GiftCardSettings> {
  const store = loadStore();
  store.settings = {
    ...store.settings,
    ...updates,
    designs: updates.designs || store.settings.designs,
  };
  saveStore(store);
  return store.settings;
}

/**
 * Checks and updates expired status on a card based on current time.
 */
function checkExpiry(card: GiftCard): boolean {
  if (!card.expiryDate) return false;
  const isExpired = new Date(card.expiryDate).getTime() < Date.now();
  if (isExpired && card.status === "active") {
    card.status = "expired";
    card.updatedAt = new Date().toISOString();
  }
  return isExpired;
}

export interface IssueGiftCardInput {
  amount: number;
  designId: string;
  senderName: string;
  senderEmail: string;
  recipientName: string;
  recipientEmail: string;
  message?: string;
  orderId?: number;
  type?: "purchased" | "complimentary" | "promotional" | "manual";
  validityDays?: number; // Custom validity in days, 0 = no expiry
  notes?: string;
  performedBy?: string;
}

/**
 * Issues a brand new gift card with unique code and records issuance in transaction ledger.
 */
export async function issueGiftCard(input: IssueGiftCardInput): Promise<{
  giftCard: GiftCard;
  transaction: GiftCardTransaction;
}> {
  const store = loadStore();
  const settings = store.settings;

  // Validate amount
  const amount = Math.round(input.amount);
  if (amount < 1) {
    throw new Error("Gift card amount must be at least ₹1");
  }

  // Find design
  const design =
    settings.designs.find((d) => d.id === input.designId) ||
    settings.designs[0];

  // Calculate expiry
  let expiryDate: string | null = null;
  const days =
    input.validityDays !== undefined
      ? input.validityDays
      : settings.defaultValidityDays;
  if (days > 0) {
    const exp = new Date();
    exp.setDate(exp.getDate() + days);
    expiryDate = exp.toISOString();
  }

  // Generate unique code with collision check
  let code = generateGiftCardCode();
  let codeHash = hashGiftCardCode(code);
  let attempts = 0;
  while (store.cards.some((c) => c.codeHash === codeHash) && attempts < 10) {
    code = generateGiftCardCode();
    codeHash = hashGiftCardCode(code);
    attempts++;
  }

  const now = new Date().toISOString();
  const cardId = `gc_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;

  const giftCard: GiftCard = {
    id: cardId,
    code,
    codeHash,
    designId: design.id,
    designTitle: design.title,
    designImage: design.image,
    initialAmount: amount,
    remainingBalance: amount,
    currency: "INR",
    senderName: input.senderName.trim(),
    senderEmail: input.senderEmail.trim().toLowerCase(),
    recipientName: input.recipientName.trim(),
    recipientEmail: input.recipientEmail.trim().toLowerCase(),
    message: input.message?.trim() || undefined,
    status: "active",
    type: input.type || "purchased",
    orderId: input.orderId,
    expiryDate,
    createdAt: now,
    updatedAt: now,
    emailDeliveryStatus: "pending",
    emailHistory: [],
    notes: input.notes,
  };

  const txId = `tx_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const transaction: GiftCardTransaction = {
    id: txId,
    giftCardId: cardId,
    giftCardCodeMasked: maskGiftCardCode(code),
    type: "issuance",
    amount,
    balanceBefore: 0,
    balanceAfter: amount,
    orderId: input.orderId,
    note:
      input.type === "manual"
        ? `Manual issuance by ${input.performedBy || "Admin"}: ${input.notes || "No notes"}`
        : `Purchased via Order #${input.orderId || "Direct"}`,
    performedBy: input.performedBy || (input.type === "purchased" ? "System (Checkout)" : "Admin"),
    createdAt: now,
  };

  store.cards.unshift(giftCard);
  store.transactions.unshift(transaction);
  saveStore(store);

  return { giftCard, transaction };
}

/**
 * Looks up a gift card by raw code (case-insensitive, ignores spaces/dashes).
 */
export async function getGiftCardByCode(rawCode: string): Promise<GiftCard | null> {
  const store = loadStore();
  const codeHash = hashGiftCardCode(rawCode);
  const card = store.cards.find((c) => c.codeHash === codeHash);
  if (!card) return null;

  // Check expiry
  if (checkExpiry(card)) {
    saveStore(store);
  }

  return card;
}

/**
 * Looks up a gift card by internal ID.
 */
export async function getGiftCardById(id: string): Promise<GiftCard | null> {
  const store = loadStore();
  const card = store.cards.find((c) => c.id === id);
  if (!card) return null;

  if (checkExpiry(card)) {
    saveStore(store);
  }
  return card;
}

export interface ValidationResult {
  valid: boolean;
  code: string;
  maskedCode: string;
  initialAmount: number;
  availableBalance: number;
  appliedAmount: number;
  remainingOrderTotal: number;
  remainingGiftCardBalance: number;
  expiryDate: string | null;
  status: GiftCardStatus;
  designTitle: string;
  designImage: string;
  error?: string;
}

/**
 * Validates a gift card for checkout redemption.
 */
export async function validateGiftCardForCheckout(
  rawCode: string,
  orderTotal: number
): Promise<ValidationResult> {
  const card = await getGiftCardByCode(rawCode);

  if (!card) {
    return {
      valid: false,
      code: rawCode,
      maskedCode: maskGiftCardCode(rawCode),
      initialAmount: 0,
      availableBalance: 0,
      appliedAmount: 0,
      remainingOrderTotal: orderTotal,
      remainingGiftCardBalance: 0,
      expiryDate: null,
      status: "disabled",
      designTitle: "",
      designImage: "",
      error: "Invalid gift card code. Please check and try again.",
    };
  }

  if (card.status === "disabled") {
    return {
      valid: false,
      code: card.code,
      maskedCode: maskGiftCardCode(card.code),
      initialAmount: card.initialAmount,
      availableBalance: card.remainingBalance,
      appliedAmount: 0,
      remainingOrderTotal: orderTotal,
      remainingGiftCardBalance: card.remainingBalance,
      expiryDate: card.expiryDate,
      status: card.status,
      designTitle: card.designTitle,
      designImage: card.designImage,
      error: "This gift card has been disabled by an administrator.",
    };
  }

  if (card.status === "expired" || (card.expiryDate && new Date(card.expiryDate).getTime() < Date.now())) {
    return {
      valid: false,
      code: card.code,
      maskedCode: maskGiftCardCode(card.code),
      initialAmount: card.initialAmount,
      availableBalance: card.remainingBalance,
      appliedAmount: 0,
      remainingOrderTotal: orderTotal,
      remainingGiftCardBalance: card.remainingBalance,
      expiryDate: card.expiryDate,
      status: "expired",
      designTitle: card.designTitle,
      designImage: card.designImage,
      error: "This gift card has expired.",
    };
  }

  if (card.remainingBalance <= 0 || card.status === "redeemed") {
    return {
      valid: false,
      code: card.code,
      maskedCode: maskGiftCardCode(card.code),
      initialAmount: card.initialAmount,
      availableBalance: 0,
      appliedAmount: 0,
      remainingOrderTotal: orderTotal,
      remainingGiftCardBalance: 0,
      expiryDate: card.expiryDate,
      status: "redeemed",
      designTitle: card.designTitle,
      designImage: card.designImage,
      error: "This gift card has already been fully redeemed.",
    };
  }

  // Calculate redemption amount
  const appliedAmount = Math.min(card.remainingBalance, orderTotal);
  const remainingOrderTotal = Math.max(0, orderTotal - appliedAmount);
  const remainingGiftCardBalance = Math.max(0, card.remainingBalance - appliedAmount);

  return {
    valid: true,
    code: card.code,
    maskedCode: maskGiftCardCode(card.code),
    initialAmount: card.initialAmount,
    availableBalance: card.remainingBalance,
    appliedAmount,
    remainingOrderTotal,
    remainingGiftCardBalance,
    expiryDate: card.expiryDate,
    status: "active",
    designTitle: card.designTitle,
    designImage: card.designImage,
  };
}

/**
 * Atomically redeems an amount from a gift card.
 */
export async function redeemGiftCard(params: {
  code: string;
  amount: number;
  orderId?: number;
  performedBy?: string;
  note?: string;
}): Promise<{
  giftCard: GiftCard;
  transaction: GiftCardTransaction;
}> {
  const store = loadStore();
  const codeHash = hashGiftCardCode(params.code);
  const cardIndex = store.cards.findIndex((c) => c.codeHash === codeHash);

  if (cardIndex === -1) {
    throw new Error("Gift card not found");
  }

  const card = store.cards[cardIndex];
  if (card.status !== "active") {
    throw new Error(`Cannot redeem gift card in '${card.status}' status`);
  }

  if (card.expiryDate && new Date(card.expiryDate).getTime() < Date.now()) {
    card.status = "expired";
    saveStore(store);
    throw new Error("This gift card has expired");
  }

  const deductAmount = Math.round(params.amount);
  if (deductAmount <= 0) {
    throw new Error("Redemption amount must be greater than zero");
  }

  if (card.remainingBalance < deductAmount) {
    throw new Error(
      `Insufficient gift card balance. Available: ₹${card.remainingBalance}, Requested: ₹${deductAmount}`
    );
  }

  const balanceBefore = card.remainingBalance;
  const balanceAfter = balanceBefore - deductAmount;
  const now = new Date().toISOString();

  card.remainingBalance = balanceAfter;
  card.lastUsedAt = now;
  card.updatedAt = now;

  if (balanceAfter === 0) {
    card.status = "redeemed";
  }

  const txId = `tx_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const transaction: GiftCardTransaction = {
    id: txId,
    giftCardId: card.id,
    giftCardCodeMasked: maskGiftCardCode(card.code),
    type: "redemption",
    amount: deductAmount,
    balanceBefore,
    balanceAfter,
    orderId: params.orderId,
    note: params.note || `Redeemed on Order #${params.orderId || "Online Checkout"}`,
    performedBy: params.performedBy || "Customer (Checkout)",
    createdAt: now,
  };

  store.transactions.unshift(transaction);
  saveStore(store);

  return { giftCard: card, transaction };
}

/**
 * Adjusts a gift card balance manually by administrator with an audit note.
 */
export async function adjustGiftCardBalance(params: {
  id: string;
  amount: number;
  type: "admin_credit" | "admin_debit";
  note: string;
  performedBy: string;
}): Promise<{
  giftCard: GiftCard;
  transaction: GiftCardTransaction;
}> {
  const store = loadStore();
  const card = store.cards.find((c) => c.id === params.id);
  if (!card) throw new Error("Gift card not found");

  const amount = Math.abs(Math.round(params.amount));
  if (amount <= 0) throw new Error("Adjustment amount must be positive");

  const balanceBefore = card.remainingBalance;
  let balanceAfter = balanceBefore;

  if (params.type === "admin_credit") {
    balanceAfter = balanceBefore + amount;
    if (card.status === "redeemed" && balanceAfter > 0) {
      card.status = "active";
    }
  } else {
    if (balanceBefore < amount) {
      throw new Error(`Cannot debit ₹${amount}. Current balance is ₹${balanceBefore}`);
    }
    balanceAfter = balanceBefore - amount;
    if (balanceAfter === 0) {
      card.status = "redeemed";
    }
  }

  const now = new Date().toISOString();
  card.remainingBalance = balanceAfter;
  card.updatedAt = now;

  const txId = `tx_${Date.now()}_${crypto.randomBytes(3).toString("hex")}`;
  const transaction: GiftCardTransaction = {
    id: txId,
    giftCardId: card.id,
    giftCardCodeMasked: maskGiftCardCode(card.code),
    type: params.type,
    amount,
    balanceBefore,
    balanceAfter,
    note: params.note,
    performedBy: params.performedBy,
    createdAt: now,
  };

  store.transactions.unshift(transaction);
  saveStore(store);

  return { giftCard: card, transaction };
}

/**
 * Updates a gift card status (active, disabled).
 */
export async function updateGiftCardStatus(
  id: string,
  newStatus: GiftCardStatus,
  note?: string,
  performedBy?: string
): Promise<GiftCard> {
  const store = loadStore();
  const card = store.cards.find((c) => c.id === id);
  if (!card) throw new Error("Gift card not found");

  card.status = newStatus;
  card.updatedAt = new Date().toISOString();

  if (note) {
    card.notes = card.notes ? `${card.notes}\n[${new Date().toISOString()}] ${note}` : note;
  }

  saveStore(store);
  return card;
}

/**
 * Extends or updates gift card expiry date.
 */
export async function extendGiftCardExpiry(
  id: string,
  newExpiryDate: string | null,
  note?: string,
  performedBy?: string
): Promise<GiftCard> {
  const store = loadStore();
  const card = store.cards.find((c) => c.id === id);
  if (!card) throw new Error("Gift card not found");

  card.expiryDate = newExpiryDate;
  card.updatedAt = new Date().toISOString();

  // If was expired and date pushed into future, reactivate if balance > 0
  if (card.status === "expired" && card.remainingBalance > 0) {
    if (!newExpiryDate || new Date(newExpiryDate).getTime() > Date.now()) {
      card.status = "active";
    }
  }

  if (note) {
    card.notes = card.notes
      ? `${card.notes}\n[${new Date().toISOString()}] Expiry updated by ${performedBy || "Admin"}: ${note}`
      : `Expiry updated: ${note}`;
  }

  saveStore(store);
  return card;
}

/**
 * Records an email delivery attempt into gift card history.
 */
export async function recordGiftCardEmail(
  id: string,
  record: EmailDeliveryRecord
): Promise<GiftCard> {
  const store = loadStore();
  const card = store.cards.find((c) => c.id === id);
  if (!card) throw new Error("Gift card not found");

  card.emailHistory.unshift(record);
  card.emailDeliveryStatus = record.status;
  card.updatedAt = new Date().toISOString();

  saveStore(store);
  return card;
}

/**
 * Queries all gift cards with pagination, search, and status filtering.
 */
export async function getGiftCardsPaged(params?: {
  search?: string;
  status?: string;
  page?: number;
  limit?: number;
}): Promise<{
  cards: GiftCard[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const store = loadStore();
  let list = [...store.cards];

  // Refresh any expired cards
  list.forEach(checkExpiry);

  if (params?.status && params.status !== "all") {
    list = list.filter((c) => c.status === params.status);
  }

  if (params?.search) {
    const q = params.search.toLowerCase().trim();
    list = list.filter(
      (c) =>
        c.id.toLowerCase().includes(q) ||
        c.code.toLowerCase().includes(q) ||
        c.recipientEmail.toLowerCase().includes(q) ||
        c.recipientName.toLowerCase().includes(q) ||
        c.senderName.toLowerCase().includes(q) ||
        c.senderEmail.toLowerCase().includes(q) ||
        String(c.orderId || "").includes(q)
    );
  }

  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 20);
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const cards = list.slice((page - 1) * limit, page * limit);

  return { cards, total, page, totalPages };
}

/**
 * Queries all transactions with pagination and filters.
 */
export async function getGiftCardTransactionsPaged(params?: {
  giftCardId?: string;
  type?: string;
  page?: number;
  limit?: number;
}): Promise<{
  transactions: GiftCardTransaction[];
  total: number;
  page: number;
  totalPages: number;
}> {
  const store = loadStore();
  let list = [...store.transactions];

  if (params?.giftCardId) {
    list = list.filter((t) => t.giftCardId === params.giftCardId);
  }

  if (params?.type && params.type !== "all") {
    list = list.filter((t) => t.type === params.type);
  }

  const page = Math.max(1, params?.page || 1);
  const limit = Math.max(1, params?.limit || 25);
  const total = list.length;
  const totalPages = Math.ceil(total / limit) || 1;
  const transactions = list.slice((page - 1) * limit, page * limit);

  return { transactions, total, page, totalPages };
}

/**
 * Calculates admin overview metrics for the Gift Cards dashboard.
 */
export async function getGiftCardOverview(): Promise<{
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
}> {
  const store = loadStore();
  const cards = store.cards;
  cards.forEach(checkExpiry);

  const totalIssued = cards.length;
  const totalValueIssued = cards.reduce((sum, c) => sum + c.initialAmount, 0);
  const outstandingBalance = cards.reduce((sum, c) => sum + c.remainingBalance, 0);
  const totalRedeemedValue = Math.max(0, totalValueIssued - outstandingBalance);

  const activeCount = cards.filter((c) => c.status === "active").length;
  const expiredCount = cards.filter((c) => c.status === "expired").length;
  const redeemedCount = cards.filter((c) => c.status === "redeemed").length;
  const disabledCount = cards.filter((c) => c.status === "disabled").length;

  const recentCards = cards.slice(0, 8);
  const recentTransactions = store.transactions.slice(0, 10);

  // Calculate monthly stats for the last 6 months
  const monthsMap = new Map<string, { sales: number; redemptions: number }>();
  const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
  const now = new Date();

  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
    monthsMap.set(key, { sales: 0, redemptions: 0 });
  }

  for (const card of cards) {
    const d = new Date(card.createdAt);
    const key = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
    if (monthsMap.has(key)) {
      monthsMap.get(key)!.sales += card.initialAmount;
    }
  }

  for (const tx of store.transactions) {
    if (tx.type === "redemption") {
      const d = new Date(tx.createdAt);
      const key = `${monthNames[d.getMonth()]} ${d.getFullYear() % 100}`;
      if (monthsMap.has(key)) {
        monthsMap.get(key)!.redemptions += tx.amount;
      }
    }
  }

  const monthlySales = Array.from(monthsMap.entries()).map(([month, data]) => ({
    month,
    sales: data.sales,
    redemptions: data.redemptions,
  }));

  return {
    totalIssued,
    totalValueIssued,
    totalRedeemedValue,
    outstandingBalance,
    activeCount,
    expiredCount,
    redeemedCount,
    disabledCount,
    recentCards,
    recentTransactions,
    monthlySales,
  };
}

/**
 * Retrieves gift cards associated with a customer email (purchased or received).
 */
export async function getCustomerGiftCards(email: string): Promise<{
  purchased: GiftCard[];
  received: GiftCard[];
}> {
  const store = loadStore();
  const cleanEmail = email.toLowerCase().trim();

  store.cards.forEach(checkExpiry);

  const purchased = store.cards.filter(
    (c) => c.senderEmail.toLowerCase() === cleanEmail
  );
  const received = store.cards.filter(
    (c) => c.recipientEmail.toLowerCase() === cleanEmail
  );

  return { purchased, received };
}
