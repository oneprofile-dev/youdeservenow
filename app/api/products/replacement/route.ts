/**
 * API endpoint: Get replacement link for dead product
 * Returns replacement URL and metadata instantly from cache
 */

import { NextRequest, NextResponse } from "next/server";
import { kv } from "@vercel/kv";
import deadLinksData from "@/data/dead-links.json";
import { trackReferralClick } from "@/lib/viral";
import { generateId } from "@/lib/utils";

export const runtime = "nodejs";

interface DeadLinkEntry {
  id: string;
  name: string;
  was: string;
  replacement: string;
}

interface LinkValidation {
  status: "alive" | "dead" | "unknown";
  lastChecked?: string;
}

interface ReplacementResponse {
  asin: string;
  originalUrl: string;
  replacementUrl: string;
  replacementName: string;
  source: string;
}

/**
 * Extract ASIN from Amazon URL
 */
function extractAsin(url: string): string | null {
  const match = url.match(/\/dp\/([A-Z0-9]+)/);
  return match ? match[1] : null;
}

/**
 * Get replacement link for a dead ASIN
 */
function findReplacement(asin: string): DeadLinkEntry | null {
  const deadLinks = deadLinksData as DeadLinkEntry[];

  return (
    deadLinks.find((entry) => {
      const originalAsin = extractAsin(entry.was);
      return originalAsin === asin;
    }) || null
  );
}

export async function GET(request: NextRequest) {
  try {
    const asin = request.nextUrl.searchParams.get("asin");
    const shouldRedirect = request.nextUrl.searchParams.get("redirect") === "1";
    const fallbackUrl = request.nextUrl.searchParams.get("url");

    if (!asin) {
      return NextResponse.json(
        { error: "Missing ASIN parameter" },
        { status: 400 }
      );
    }

    const redirectToTarget = async (target: string | null | undefined) => {
      if (!target) {
        return NextResponse.json(
          { error: "Missing fallback URL for redirect" },
          { status: 400 }
        );
      }

      try {
        // Referral tracking: if a ref code is present in the querystring or cookie,
        // record the click server-side and ensure the visitor has an id cookie.
        const refCode = request.nextUrl.searchParams.get("ref") || request.cookies.get("ref")?.value;
        let visitorId = request.cookies.get("visitor_id")?.value;

        if (!visitorId) {
          // lazy-generate a stable visitor id for attribution
          visitorId = generateId();
        }

        if (refCode) {
          try {
            // record the click for the referral code
            await trackReferralClick(refCode, visitorId);
          } catch (err) {
            // don't block the redirect on tracking errors
            console.warn("Failed to track referral click:", err);
          }
        }

        // Propagate ref param to target where possible for downstream attribution
        let finalTarget = target;
        if (refCode) {
          finalTarget += finalTarget.includes("?") ? `&ref=${encodeURIComponent(refCode)}` : `?ref=${encodeURIComponent(refCode)}`;
        }

        const response = NextResponse.redirect(finalTarget, 307);

        // Persist visitor id cookie for 30 days if not present
        if (!request.cookies.get("visitor_id")) {
          response.cookies.set("visitor_id", visitorId, {
            path: "/",
            maxAge: 60 * 60 * 24 * 30,
            sameSite: "lax",
          });
        }

        return response;
      } catch (err) {
        // On any error, fall back to a plain redirect
        return NextResponse.redirect(target, 307);
      }
    };

    // Check server cache first
    const cacheKey = `link-replacement:${asin}`;
    const cachedReplacement = await kv.get<ReplacementResponse>(cacheKey).catch(() => null);

    if (cachedReplacement) {
      if (shouldRedirect) {
        return redirectToTarget(cachedReplacement.replacementUrl || fallbackUrl);
      }
      return NextResponse.json(cachedReplacement);
    }

    // Check dead-links.json
    const replacement = findReplacement(asin);

    if (replacement) {
      const response: ReplacementResponse = {
        asin,
        originalUrl: replacement.was,
        replacementUrl: replacement.replacement,
        replacementName: replacement.name,
        source: "dead-links",
      };

      // Cache for 24 hours
      await kv.setex(cacheKey, 86400, response).catch(() => {});

      if (shouldRedirect) {
        return redirectToTarget(response.replacementUrl);
      }

      return NextResponse.json(response);
    }

    // Check if we have a validation result in cache
    const validationKey = `link-status:${asin}`;
    const validation = await kv.get<LinkValidation>(validationKey).catch(() => null);

    if (validation) {
      if (shouldRedirect) {
        return redirectToTarget(fallbackUrl);
      }

      return NextResponse.json({
        asin,
        status: validation.status,
        lastChecked: validation.lastChecked,
        isDead: validation.status === "dead",
      });
    }

    // Not found in any cache
    if (shouldRedirect) {
      return redirectToTarget(fallbackUrl);
    }

    return NextResponse.json(
      { asin, status: "unknown", replacementUrl: null },
      { status: 404 }
    );
  } catch (error) {
    console.error("[API] Product replacement error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
