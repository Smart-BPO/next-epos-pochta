/** Client calculator slider bounds — derived from DEFAULT pricing config. */

import { DEFAULT_PRICING_CONFIG } from "@/lib/pricing/types";

export const CALC_LIMITS = DEFAULT_PRICING_CONFIG.limits;

export type CalcLimitKey = keyof typeof CALC_LIMITS;

export const CALC_QUICK_CITIES = DEFAULT_PRICING_CONFIG.quickCityIds;
