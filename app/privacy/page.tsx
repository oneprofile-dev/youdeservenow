import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy Policy — YouDeserveNow",
  description: "How YouDeserveNow collects, uses, and protects your information.",
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1 max-w-2xl mx-auto w-full px-4 sm:px-6 py-16">
        <div className="mb-10">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-3">
            Institute Legal Division
          </p>
          <h1
            className="text-4xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Privacy Policy
          </h1>
          <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            Last updated: April 2026
          </p>
        </div>

        <div className="space-y-8 text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] text-sm leading-relaxed">
          <section>
            <h2
              className="text-lg text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              What we collect
            </h2>
            <p>
              When you submit an accomplishment, we store the text you entered along with the AI-generated
              justification and product recommendation. This is displayed publicly in our gallery unless you
              request removal. We do not collect your name, email address, or any account information.
            </p>
            <p className="mt-3">
              We use{" "}
              <a
                href="https://vercel.com/analytics"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline underline-offset-4"
              >
                Vercel Analytics
              </a>{" "}
              for anonymous, privacy-friendly usage metrics. No personal identifiers are collected or stored
              by our analytics system.
            </p>
          </section>

          <section>
            <h2
              className="text-lg text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Affiliate links
            </h2>
            <p>
              Product recommendations on this site include Amazon affiliate links. When you click a product
              link and make a purchase, we may earn a small commission at no extra cost to you. This helps
              keep the Institute running. Amazon may set cookies when you visit their site — their{" "}
              <a
                href="https://www.amazon.com/gp/help/customer/display.html?nodeId=468496"
                target="_blank"
                rel="noopener noreferrer"
                className="text-[var(--color-accent)] underline underline-offset-4"
              >
                privacy policy
              </a>{" "}
              applies.
            </p>
          </section>

          <section>
            <h2
              className="text-lg text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              AI processing
            </h2>
            <p>
              Your accomplishment text is sent to third-party AI APIs (Google Gemini and Groq) to generate
              a justification. Please do not include sensitive personal information in your submission. Do
              not submit passwords, financial information, or private health details.
            </p>
          </section>

          <section>
            <h2
              className="text-lg text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Cookies &amp; storage
            </h2>
            <p>
              We use browser local storage only for theme preference (dark/light mode). We do not use
              tracking cookies or fingerprinting. Rate-limiting uses your IP address server-side and is
              not stored beyond a short rolling window.
            </p>
          </section>

          <section>
            <h2
              className="text-lg text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Data removal
            </h2>
            <p>
              If you submitted an accomplishment and would like it removed from the gallery, contact us at{" "}
              <a
                href="mailto:hello@youdeservenow.com"
                className="text-[var(--color-accent)] underline underline-offset-4"
              >
                hello@youdeservenow.com
              </a>{" "}
              with the result URL. We will remove it within 48 hours.
            </p>
          </section>

          <section>
            <h2
              className="text-lg text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Changes
            </h2>
            <p>
              We may update this policy occasionally. The "last updated" date at the top reflects the
              most recent revision. Continued use of the site constitutes acceptance of any changes.
            </p>
          </section>

          <div className="pt-4 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
            <Link
              href="/"
              className="text-sm text-[var(--color-accent)] hover:underline underline-offset-4"
            >
              ← Return to the Institute
            </Link>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}
