export const DEFAULT_FREE_DELIVERY = { promptAt: 600, threshold: 750 };

export const DEFAULT_LOYALTY_TIERS = {
  bronze: { minPoints: 0, multiplier: 1 },
  silver: { minPoints: 500, multiplier: 1.25 },
  gold: { minPoints: 1500, multiplier: 1.5 },
  platinum: { minPoints: 5000, multiplier: 2 }
};

export const UPSELL_TYPES = [
  { value: "combo", label: "Combo" },
  { value: "cross_sell", label: "Cross-sell" },
  { value: "upsell", label: "Upsell" },
  { value: "free_delivery_progress", label: "Free delivery progress" },
  { value: "premium_upgrade", label: "Premium upgrade" },
  { value: "frequently_bought", label: "Frequently bought" }
];
