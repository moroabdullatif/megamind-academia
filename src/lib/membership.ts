export const PREMIUM_PLAN = {
  monthlyUsd: 4.99,
  yearlyUsd: 39.99,
  checkoutEnabled: false,
} as const;

export type PremiumFeature = "ai-terms" | "smart-hints" | "provider-choice";

// No paid entitlements exist yet. Never trust player data or browser storage
// as proof of payment; replace this with verified membership after activation.
export function canUsePremium(_feature: PremiumFeature): boolean {
  return false;
}

export const PREMIUM_LOCK_MESSAGE = "AI extras are Premium-only. Membership purchases are not available yet; classic games remain free.";