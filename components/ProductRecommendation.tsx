"use client";

import Image from "next/image";
import { useMemo, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { track } from "@vercel/analytics/react";
import type { Product } from "@/lib/products";
import { resolveAffiliateUrl, isHighCommission, getCountryFromCookie } from "@/lib/affiliate";
import { useLinkHealth } from "@/lib/useLink";
import { initLinkCache } from "@/lib/client-link-cache";

interface ProductRecommendationProps {
  product: Product;
}

function ProductRecommendationInner({ product }: ProductRecommendationProps) {
  const searchParams = useSearchParams();
  const refParam = searchParams.get("ref");

  useEffect(() => {
    initLinkCache();
  }, []);

  const affiliateUrl = useMemo(() => {
    return resolveAffiliateUrl(
      {
        baseUrl: product.affiliateUrl,
        network: product.affiliateNetwork,
        networkId: product.affiliateNetworkId,
        commission: product.commission,
      },
      getCountryFromCookie()
    );
  }, [product]);

  const amazonAsin = useMemo(() => {
    return affiliateUrl.match(/\/dp\/([A-Z0-9]+)/)?.[1] ?? null;
  }, [affiliateUrl]);

  const highValue = isHighCommission(product.commission);

  const { isDead } = useLinkHealth(affiliateUrl);

  const ctaHref = useMemo(() => {
    if (!amazonAsin) {
      return affiliateUrl;
    }

    const params = new URLSearchParams({
      asin: amazonAsin,
      redirect: "1",
      url: affiliateUrl,
    });

    if (refParam) {
      params.set("ref", refParam);
    }

    return `/api/products/replacement?${params.toString()}`;
  }, [affiliateUrl, amazonAsin, refParam]);

  const linkStatus = useMemo(() => {
    if (amazonAsin) {
      return "server_checked";
    }

    return isDead ? "dead" : "direct";
  }, [amazonAsin, isDead]);

  return (
    <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
      <div className="relative w-20 h-20 rounded-lg overflow-hidden flex-shrink-0 bg-white">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="object-cover"
          sizes="80px"
        />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-medium">
            Prescribed Reward
          </p>
          {highValue && (
            <span className="text-[10px] uppercase tracking-wider font-semibold px-1.5 py-0.5 rounded-full bg-emerald-50 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-700">
              Top Pick
            </span>
          )}
        </div>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mt-0.5">
          {product.price}
        </p>
      </div>

      <a
        href={ctaHref}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() => {
          // Warn if link was detected as dead
          if (isDead) {
            console.warn("Product link detected as dead, showing replacement or warning");
          }
          
          track("affiliate_click", {
            product_id: product.id,
            price: product.price,
            category: product.category,
            network: product.affiliateNetwork ?? "amazon",
            linkStatus,
          });
          if (typeof window !== "undefined" && window.ttq) {
            window.ttq.track("InitiateCheckout", {
              content_id: product.id,
              content_name: product.name,
              content_category: product.category,
              value: parseFloat(product.price.replace(/[^0-9.]/g, "")) || 0,
              currency: "USD",
            });
          }
        }}
        className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] text-sm font-semibold hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
      >
        Claim Reward →
      </a>
    </div>
  );
}

export default function ProductRecommendation(props: ProductRecommendationProps) {
  return (
    <Suspense
      fallback={
        <div className="flex items-center gap-4 p-4 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] h-[7.5rem] animate-pulse" />
      }
    >
      <ProductRecommendationInner {...props} />
    </Suspense>
  );
}
