import Image from "next/image";
import Link from "next/link";
import {
  PRESCRIPTION_COLLECTIONS,
  getProductsForCollection,
} from "@/lib/prescription-collections";
import { getAllProducts } from "@/lib/products";

export default function PrescriptionCollections() {
  const products = getAllProducts();

  return (
    <section
      className="max-w-5xl mx-auto px-4 sm:px-6 mt-16 mb-4"
      aria-labelledby="prescription-collections-heading"
    >
      <div className="mb-8 text-center max-w-2xl mx-auto">
        <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
          Curated intent
        </p>
        <h2
          id="prescription-collections-heading"
          className="text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
          style={{ fontFamily: "var(--font-display)" }}
        >
          Prescription themes—not random shopping
        </h2>
        <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] leading-relaxed">
          Every reward here still flows through your story. Themes help you see what “deserve” can look like
          for couples, recovery, and momentum—then we match you properly from the same catalogue.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {PRESCRIPTION_COLLECTIONS.map((col) => {
          const samples = getProductsForCollection(products, col, 3);
          return (
            <article
              key={col.id}
              className="flex flex-col rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] p-5 shadow-sm"
            >
              <div className="mb-4">
                <span className="text-2xl mr-2" aria-hidden>
                  {col.emoji}
                </span>
                <h3
                  className="text-lg font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] inline"
                  style={{ fontFamily: "var(--font-display)" }}
                >
                  {col.title}
                </h3>
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] mt-2 leading-relaxed">
                  {col.subtitle}
                </p>
              </div>

              <ul className="flex gap-2 mb-5 flex-1" aria-hidden>
                {samples.map((p) => (
                  <li
                    key={p.id}
                    className="relative flex-1 min-h-[72px] rounded-lg overflow-hidden bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]"
                  >
                    <Image
                      src={p.imageUrl}
                      alt=""
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                  </li>
                ))}
              </ul>

              <ul className="text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] space-y-1 mb-5">
                {samples.map((p) => (
                  <li key={p.id} className="line-clamp-1">
                    <span className="text-[var(--color-text-tertiary)]">{p.price}</span>{" "}
                    <span className="font-medium text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]">
                      {p.name}
                    </span>
                  </li>
                ))}
              </ul>

              <Link
                href="/#institute-diagnosis"
                className="mt-auto inline-flex justify-center items-center py-3 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] text-sm font-semibold hover:opacity-90 transition-opacity text-center"
              >
                Match my story →
              </Link>
            </article>
          );
        })}
      </div>
    </section>
  );
}
