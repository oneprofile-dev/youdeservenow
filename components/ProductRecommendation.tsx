"use client";

import Image from "next/image";
import { track } from "@vercel/analytics/react";
import type { Product } from "@/lib/products";

interface ProductRecommendationProps {
  product: Product;
}

export default function ProductRecommendation({ product }: ProductRecommendationProps) {
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
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-medium mb-1">
          Prescribed Reward
        </p>
        <h3 className="text-base font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-tight line-clamp-2">
          {product.name}
        </h3>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mt-0.5">
          {product.price}
        </p>
      </div>

      <a
        href={product.affiliateUrl}
        target="_blank"
        rel="noopener noreferrer sponsored"
        onClick={() =>
          track("affiliate_click", {
            product_id: product.id,
            price: product.price,
            category: product.category,
          })
        }
        className="flex-shrink-0 px-4 py-2.5 rounded-lg bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] text-sm font-semibold hover:opacity-90 active:scale-95 transition-all whitespace-nowrap"
      >
        Claim Reward →
      </a>
    </div>
  );
}
