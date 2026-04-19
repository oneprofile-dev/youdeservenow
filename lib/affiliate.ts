// ─── Country → Amazon domain ────────────────────────────────────────────────

const COUNTRY_DOMAINS: Record<string, string> = {
  GB: "www.amazon.co.uk",
  AU: "www.amazon.com.au",
  CA: "www.amazon.ca",
  DE: "www.amazon.de",
  FR: "www.amazon.fr",
  IT: "www.amazon.it",
  ES: "www.amazon.es",
  JP: "www.amazon.co.jp",
  IN: "www.amazon.in",
  MX: "www.amazon.com.mx",
  BR: "www.amazon.com.br",
  NL: "www.amazon.nl",
  SE: "www.amazon.se",
  PL: "www.amazon.pl",
  SG: "www.amazon.sg",
  AE: "www.amazon.ae",
};

export function localizeAffiliateUrl(url: string, country: string): string {
  const domain = COUNTRY_DOMAINS[country?.toUpperCase()];
  if (!domain) return url;
  return url.replace("www.amazon.com", domain);
}

export function getCountryFromCookie(): string {
  if (typeof document === "undefined") return "US";
  try {
    const match = document.cookie.match(/(?:^|;\s*)x-country=([^;]+)/);
    return match?.[1] ?? "US";
  } catch {
    return "US";
  }
}

// ─── Multi-network affiliate URL builder ─────────────────────────────────────
//
// Priority: premium network (when env var set) → Amazon (with country swap)
//
// Env vars required per network:
//   NEXT_PUBLIC_SHAREASALE_USER_ID  — your ShareASale publisher ID
//   NEXT_PUBLIC_CJ_PUBLISHER_ID     — your CJ Affiliate publisher ID
//   NEXT_PUBLIC_IMPACT_ACCOUNT_SID  — your Impact account SID
//
// These are NEXT_PUBLIC_ so they're readable client-side for the
// ProductRecommendation component without an API round-trip.

export type AffiliateNetwork = "amazon" | "shareasale" | "cj" | "impact" | "direct";

export interface AffiliateConfig {
  /** The always-available fallback URL (usually Amazon) */
  baseUrl: string;
  /** Which premium network this product belongs to */
  network?: AffiliateNetwork;
  /** ShareASale: merchant ID, CJ: link ID, Impact: campaign slug, direct: override URL */
  networkId?: string;
  /** Human-readable commission, e.g. "15%" or "$40 CPA" */
  commission?: string;
}

function buildShareASaleUrl(merchantId: string, landingUrl: string): string | null {
  const userId = process.env.NEXT_PUBLIC_SHAREASALE_USER_ID;
  if (!userId) return null;
  return `https://www.shareasale.com/r.cfm?b=1&u=${userId}&m=${merchantId}&urllink=${encodeURIComponent(landingUrl)}`;
}

function buildCjUrl(linkId: string): string | null {
  const publisherId = process.env.NEXT_PUBLIC_CJ_PUBLISHER_ID;
  if (!publisherId) return null;
  return `https://www.anrdoezrs.net/click-${publisherId}-${linkId}`;
}

function buildImpactUrl(campaignSlug: string, landingUrl: string): string | null {
  const accountSid = process.env.NEXT_PUBLIC_IMPACT_ACCOUNT_SID;
  if (!accountSid) return null;
  return `https://impact.com/c/${accountSid}/${campaignSlug}?u=${encodeURIComponent(landingUrl)}`;
}

export function resolveAffiliateUrl(config: AffiliateConfig, country = "US"): string {
  const { baseUrl, network, networkId } = config;

  if (network && networkId) {
    let premiumUrl: string | null = null;

    if (network === "shareasale") {
      premiumUrl = buildShareASaleUrl(networkId, baseUrl);
    } else if (network === "cj") {
      premiumUrl = buildCjUrl(networkId);
    } else if (network === "impact") {
      premiumUrl = buildImpactUrl(networkId, baseUrl);
    } else if (network === "direct") {
      // networkId IS the direct affiliate URL — no env var needed
      premiumUrl = networkId;
    }

    if (premiumUrl) return premiumUrl;
  }

  // Fallback: Amazon with country localisation
  return localizeAffiliateUrl(baseUrl, country);
}

export function isHighCommission(commission?: string): boolean {
  if (!commission) return false;
  const num = parseFloat(commission.replace(/[^0-9.]/g, ""));
  if (commission.includes("%")) return num >= 10;
  if (commission.toLowerCase().includes("cpa")) return num >= 20;
  return false;
}
