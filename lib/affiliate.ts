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
