// Server-authoritative pricing. Must stay in sync with the option tables in
// components/sections/Customizer.tsx and the cart helpers in lib/store.ts —
// the client versions are display-only; these are what orders are charged with.

export const BASE_PRICE = 420000;

export const CUSTOM_STRAPS: Record<string, number> = {
  "Midnight Black": 0,
  "Cognac Brown": 15000,
  "Navy Blue": 15000,
  "Oxblood": 15000,
  "Gold Croc": 35000,
  "Ivory White": 20000,
};

export const CUSTOM_CASES: Record<string, number> = {
  "Gold PVD": 0,
  "Steel": 0,
  "Rose Gold": 25000,
  "Black DLC": 20000,
};

export const CUSTOM_DIALS: Record<string, number> = {
  "Sunray Black": 0,
  "Guilloche Gold": 30000,
  "Deep Blue": 20000,
  "Skeleton": 50000,
};

// Total price for a custom build, or null when any option name is unknown.
export function customPrice(strapName: string, caseName: string, dialName: string): number | null {
  const strap = CUSTOM_STRAPS[strapName];
  const caseFinish = CUSTOM_CASES[caseName];
  const dial = CUSTOM_DIALS[dialName];
  if (strap === undefined || caseFinish === undefined || dial === undefined) return null;
  return BASE_PRICE + strap + caseFinish + dial;
}

export function paystackFee(amount: number): number {
  return Math.min(Math.round(amount * 0.015 + 100), 2000);
}
