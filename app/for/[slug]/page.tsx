import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import DeserveChecklist from "@/components/DeserveChecklist";
import { getPSEOPage, PSEO_PAGES } from "@/lib/pseo-config";
import { getRecentResults } from "@/lib/db";
import { getSiteUrl, truncate } from "@/lib/utils";

// ISR: regenerate every hour so new community results flow in
export const revalidate = 3600;

interface Props {
  params: Promise<{ slug: string }>;
}

export function generateStaticParams() {
  return PSEO_PAGES.map((p) => ({ slug: p.slug }));
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  const page = getPSEOPage(slug);
  if (!page) return { title: "Not Found" };

  const siteUrl = getSiteUrl();
  return {
    title: page.headline,
    description: page.metaDescription,
    openGraph: {
      title: page.headline,
      description: page.metaDescription,
      url: `${siteUrl}/for/${slug}`,
      type: "website",
      images: [{ url: "/og-image.svg", width: 1200, height: 630 }],
    },
    twitter: {
      card: "summary_large_image",
      title: page.headline,
      description: page.metaDescription,
    },
  };
}

export default async function ForPage({ params }: Props) {
  const { slug } = await params;
  const page = getPSEOPage(slug);
  if (!page) notFound();

  // Pull recent results, filter to this page's categories
  const { results: allResults } = await getRecentResults(0, 60);
  const categoryResults = allResults
    .filter((r) => page.categories.includes(r.product.category))
    .slice(0, 6);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-4xl mx-auto">
          {/* Hero section */}
          <div className="text-center mb-14 pt-6">
            <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-4">
              YouDeserveNow Research Institute
            </p>
            <h1
              className="text-4xl sm:text-5xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-[1.1] mb-6"
              style={{ fontFamily: "var(--font-display)" }}
            >
              {page.headline}
            </h1>
            <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] text-lg max-w-2xl mx-auto mb-10">
              {page.subheadline}
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-8 py-4 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] font-semibold hover:opacity-90 active:scale-95 transition-all text-lg"
            >
              Get My Scientific Justification →
            </Link>
          </div>

          {/* Interactive Deserve Checklist — the "Value Block" that drives dwell time */}
          <DeserveChecklist title={page.checklistTitle} items={page.checklist} />

          {/* Community verdicts for this category */}
          {categoryResults.length > 0 && (
            <div className="mt-20">
              <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-3 text-center">
                Recent Scientific Verdicts
              </p>
              <h2
                className="text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-10 text-center"
                style={{ fontFamily: "var(--font-display)" }}
              >
                What the Institute Prescribed Others
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                {categoryResults.map((result) => (
                  <Link
                    key={result.id}
                    href={`/result/${result.id}`}
                    className="block p-6 rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] hover:border-[var(--color-accent)] transition-colors group"
                  >
                    <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-2">
                      Prescribed: {result.product.name}
                    </p>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] leading-relaxed line-clamp-3">
                      {truncate(result.justification, 160)}
                    </p>
                    <p className="text-xs text-[var(--color-text-tertiary)] mt-4 group-hover:text-[var(--color-accent)] transition-colors">
                      {result.product.price} · Read full verdict →
                    </p>
                  </Link>
                ))}
              </div>
            </div>
          )}

          {/* Browse other categories */}
          <div className="mt-16 p-8 rounded-2xl border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)]">
            <p className="text-sm font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4">
              Other Deserve Research Divisions
            </p>
            <div className="flex flex-wrap gap-2">
              {PSEO_PAGES.filter((p) => p.slug !== slug).map((p) => (
                <Link
                  key={p.slug}
                  href={`/for/${p.slug}`}
                  className="text-xs px-3 py-1.5 rounded-full border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] transition-colors"
                >
                  {p.slug.replace(/-/g, " ")}
                </Link>
              ))}
            </div>
          </div>

          {/* Bottom CTA */}
          <div className="text-center mt-16 py-12 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
            <p
              className="text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What did YOU accomplish today?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Get My Scientific Justification →
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
