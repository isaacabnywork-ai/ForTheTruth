/**
 * Shipping calculation rules based on store shipping table:
 * 
 * 1. Domestic (India / "IN" / Any):
 *    Base: ₹100 for up to 0.5 kg
 *    Additional: ₹70 per 0.5 kg (or part thereof) over 0.5 kg
 *    Formula: ₹100 + ₹70 per 0.5 kg over 0.5 kg => [₹100 - ₹∞]
 * 
 * 2. International (Any except IN):
 *    Base: ₹1600 for up to 1.0 kg
 *    Additional: ₹300 per 0.5 kg (or part thereof) over 1.0 kg
 *    Formula: ₹1600 + ₹300 per 0.5 kg over 1 kg => [₹1600 - ₹∞]
 */

export const DEFAULT_BOOK_WEIGHT_KG = 0.4; // 400g default for physical books without explicit weight

export interface ShippingItem {
  quantity: number;
  weight?: number | string | null;
  isVirtual?: boolean;
}

export interface ShippingCalculationParams {
  destinationCountry?: string; // Country code (e.g. "IN", "US", "GB") or country name
  totalWeightKg?: number;
  items?: ShippingItem[];
  shippingMethod?: "delivery" | "pickup";
  subtotal?: number;
}

export interface ShippingCalculationResult {
  cost: number;
  label: string;
  ruleTitle: string;
  isInternational: boolean;
  totalWeightKg: number;
  rateFormula: string;
  breakdown: string;
}

/**
 * Normalizes country strings to test if destination is India.
 */
export function isDomesticCountry(country?: string): boolean {
  if (!country) return true; // default to India
  const c = country.trim().toUpperCase();
  return c === "IN" || c === "IND" || c === "INDIA";
}

/**
 * Calculates total weight in kilograms from a list of cart/order items.
 */
export function calculateTotalWeight(items: ShippingItem[] = []): number {
  if (!items || items.length === 0) return 0;
  
  const weight = items.reduce((sum, item) => {
    if (item.isVirtual) return sum;
    const w = item.weight != null ? parseFloat(String(item.weight)) : NaN;
    const itemWeight = !isNaN(w) && w > 0 ? w : DEFAULT_BOOK_WEIGHT_KG;
    return sum + itemWeight * (item.quantity || 1);
  }, 0);

  // Round to 2 decimal places
  return Math.round(weight * 100) / 100;
}

/**
 * Calculates shipping charges according to store shipping rules.
 */
export function calculateShipping(params: ShippingCalculationParams): ShippingCalculationResult {
  const {
    destinationCountry = "IN",
    shippingMethod = "delivery",
    subtotal = 0,
  } = params;

  // 1. Determine total weight
  let totalWeightKg = params.totalWeightKg ?? 0;
  if (params.items && params.items.length > 0) {
    totalWeightKg = calculateTotalWeight(params.items);
  }

  const isVirtualOnly =
    params.items && params.items.length > 0
      ? params.items.every((i) => i.isVirtual)
      : totalWeightKg === 0;

  // Store pickup or purely digital free/virtual downloads
  if (shippingMethod === "pickup" || isVirtualOnly || (subtotal === 0 && totalWeightKg === 0)) {
    return {
      cost: 0,
      label: shippingMethod === "pickup" ? "Store Pickup (In-Store)" : "Free Digital Delivery",
      ruleTitle: shippingMethod === "pickup" ? "Store Pickup" : "Digital Delivery",
      isInternational: false,
      totalWeightKg: 0,
      rateFormula: "₹0",
      breakdown: "Free (₹0)",
    };
  }

  // Ensure minimum effective weight of 0.1 kg for physical shipments
  const weight = Math.max(totalWeightKg, 0.1);
  const isDomestic = isDomesticCountry(destinationCountry);

  if (isDomestic) {
    // Orders over ₹150 qualify for Free Delivery across India
    if (subtotal >= 150) {
      return {
        cost: 0,
        label: "Free Delivery (India)",
        ruleTitle: "Free Delivery",
        isInternational: false,
        totalWeightKg: weight,
        rateFormula: "Free over ₹150",
        breakdown: "Free shipping for orders over ₹150",
      };
    }

    // Domestic Rule (under ₹150): ₹100 + ₹70 per 0.5 kg over 0.5 kg => [₹100 - ₹∞]
    const baseWeight = 0.5;
    const basePrice = 100;
    const extraRate = 70;

    if (weight <= baseWeight) {
      return {
        cost: basePrice,
        label: "Standard Shipping (India)",
        ruleTitle: "Shipping",
        isInternational: false,
        totalWeightKg: weight,
        rateFormula: "₹100 base (up to 0.5 kg)",
        breakdown: `₹${basePrice} base rate (${weight.toFixed(2)} kg)`,
      };
    }

    const excessWeight = weight - baseWeight;
    const brackets = Math.ceil(excessWeight / 0.5);
    const cost = basePrice + brackets * extraRate;

    return {
      cost,
      label: "Standard Shipping (India)",
      ruleTitle: "Shipping",
      isInternational: false,
      totalWeightKg: weight,
      rateFormula: `₹100 + ₹70 per 0.5 kg over 0.5 kg`,
      breakdown: `₹${basePrice} base + ${brackets} × ₹${extraRate} (${weight.toFixed(2)} kg)`,
    };
  } else {
    // International Rule: ₹1600 + ₹300 per 0.5 kg over 1 kg => [₹1600 - ₹∞]
    const baseWeight = 1.0;
    const basePrice = 1600;
    const extraRate = 300;

    if (weight <= baseWeight) {
      return {
        cost: basePrice,
        label: "International Shipping",
        ruleTitle: "Shipping (Any except IN)",
        isInternational: true,
        totalWeightKg: weight,
        rateFormula: "₹1600 base (up to 1.0 kg)",
        breakdown: `₹${basePrice} base rate (${weight.toFixed(2)} kg)`,
      };
    }

    const excessWeight = weight - baseWeight;
    const brackets = Math.ceil(excessWeight / 0.5);
    const cost = basePrice + brackets * extraRate;

    return {
      cost,
      label: "International Shipping",
      ruleTitle: "Shipping (Any except IN)",
      isInternational: true,
      totalWeightKg: weight,
      rateFormula: `₹1600 + ₹300 per 0.5 kg over 1.0 kg`,
      breakdown: `₹${basePrice} base + ${brackets} × ₹${extraRate} (${weight.toFixed(2)} kg)`,
    };
  }
}
