/** Client calculator slider bounds — not official tariff limits. */
export const CALC_LIMITS = {
  weightKg: { min: 0, max: 30, step: 0.5, default: 1 },
  lengthCm: { min: 0, max: 100, step: 1, default: 20 },
  widthCm: { min: 0, max: 100, step: 1, default: 15 },
  heightCm: { min: 0, max: 100, step: 1, default: 10 },
} as const;

export type CalcLimitKey = keyof typeof CALC_LIMITS;

export const CALC_QUICK_CITIES = [
  "tashkent",
  "samarkand",
  "fergana",
  "andijan",
] as const;
