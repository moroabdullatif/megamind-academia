import { describe, expect, it } from "vitest";
import { canUsePremium, PREMIUM_PLAN } from "@/lib/membership";

describe("Draft premium membership", () => {
  it("keeps checkout disabled until payment setup is activated", () => {
    expect(PREMIUM_PLAN.checkoutEnabled).toBe(false);
  });
  it("does not grant AI puzzle access without a verified membership", () => {
    expect(canUsePremium("ai-terms")).toBe(false);
  });
  it("does not grant smart hints without a verified membership", () => {
    expect(canUsePremium("smart-hints")).toBe(false);
  });
  it("does not grant provider selection without a verified membership", () => {
    expect(canUsePremium("provider-choice")).toBe(false);
  });
});