import type { EstimateInput, QuoteEstimate } from "@/lib/pricing/estimate";
import type { PublicPricingUiConfig } from "@/lib/pricing/types";

export async function fetchEstimate(
  input: EstimateInput,
): Promise<QuoteEstimate | null> {
  try {
    const res = await fetch("/api/estimate/", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const json = (await res.json()) as {
      estimate?: QuoteEstimate;
      error?: string;
    };
    if (!res.ok || !json.estimate) return null;
    return json.estimate;
  } catch {
    return null;
  }
}

export async function fetchPublicPricingUi(): Promise<PublicPricingUiConfig | null> {
  try {
    const res = await fetch("/api/estimate/config/", {
      method: "GET",
      cache: "no-store",
    });
    if (!res.ok) return null;
    return (await res.json()) as PublicPricingUiConfig;
  } catch {
    return null;
  }
}
