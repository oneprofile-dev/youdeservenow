import { notFound } from "next/navigation";
import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ResultCard from "@/components/ResultCard";
import ResultShareButtons from "@/components/ResultShareButtons";
import { getResult } from "@/lib/db";
import { getSiteUrl, truncate } from "@/lib/utils";
import PageViewTracker from "@/components/PageViewTracker";

interface Props {
  params: Promise<{ id: string }>;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) {
    return { title: "Result Not Found" };
  }

  const siteUrl = getSiteUrl();
  const title = `Science says I deserve ${result.product.name}`;
  const description = truncate(result.justification, 160);

  // OG card URLs for each size
  const ogCardUrls = {
    og: `${siteUrl}/api/og-card?id=${id}&size=og`,
    square: `${siteUrl}/api/og-card?id=${id}&size=square`,
  };

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      url: `${siteUrl}/result/${id}`,
      type: "article",
      images: [
        { url: ogCardUrls.og, width: 1200, height: 630, alt: title },
        { url: ogCardUrls.square, width: 1080, height: 1080, alt: title },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title,
      description,
      images: [ogCardUrls.og],
    },
  };
}

export default async function ResultPage({ params }: Props) {
  const { id } = await params;
  const result = await getResult(id);

  if (!result) notFound();

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1 py-12 px-4 sm:px-6">
        <div className="max-w-3xl mx-auto space-y-10">
          <PageViewTracker
            event="result_page_view"
            props={{ product_id: result.product.id, category: result.product.category }}
          />
          <ResultCard result={result} showShareCard />

          {/* Share Buttons */}
          <ResultShareButtons
            resultId={result.id}
            productName={result.product.name}
            userInput={result.input}
            justification={result.justification}
          />

          {/* JSON-LD structured data — escape </ to prevent script injection */}
          <script
            type="application/ld+json"
            dangerouslySetInnerHTML={{
              __html: JSON.stringify({
                "@context": "https://schema.org",
                "@type": "Article",
                headline: `Science says I deserve ${result.product.name}`,
                description: result.justification,
                datePublished: result.createdAt,
                url: `${getSiteUrl()}/result/${id}`,
              }).replace(/<\//g, "<\\/"),
            }}
          />

          {/* CTA back to home */}
          <div className="text-center py-8 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
            <p
              className="text-xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
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
