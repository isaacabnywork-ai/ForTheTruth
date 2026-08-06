/**
 * Triggers lightweight tactile vibration on supported devices (Android & mobile PWA/web apps)
 * to emulate solid native iOS/Android physical haptics on tap.
 */
export function triggerHaptic(type: "tap" | "success" | "warning" | "heavy" = "tap"): void {
  if (typeof window === "undefined" || !("vibrate" in navigator)) return;
  try {
    switch (type) {
      case "tap":
        navigator.vibrate(12); // Subtle single tap feedback
        break;
      case "success":
        navigator.vibrate([15, 40, 15]); // Double pulse for adding to cart/wishlist
        break;
      case "warning":
        navigator.vibrate([30, 50, 30]);
        break;
      case "heavy":
        navigator.vibrate(25);
        break;
    }
  } catch {
    // Ignore if vibration isn't permitted or active in browser context
  }
}
