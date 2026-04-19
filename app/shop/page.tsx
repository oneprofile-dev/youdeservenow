import type { Metadata } from "next";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ShopNotify from "@/components/ShopNotify";

export const metadata: Metadata = {
  title: "Official Merchandise — YouDeserveNow",
  description:
    "Scientifically sanctioned goods from the Institute. Wear your diagnosis with pride.",
};

const SHOP_ITEMS = [
  {
    id: "prescription-print",
    name: "Official Prescription Print",
    subtitle: "Frameable 8×10 archival print",
    description:
      "A limited-edition art print styled after the Institute's official prescription pad. Gold foil header, cream stock, genuine Latin footnotes. Frame it. Gift it. Hang it where your boss can see it.",
    price: "$24.99",
    envKey: "NEXT_PUBLIC_SHOP_PRINT_URL",
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <rect x="8" y="4" width="64" height="72" rx="4" fill="#FBF8F3" stroke="#E8E0D6" strokeWidth="1.5"/>
        <rect x="8" y="4" width="64" height="14" rx="4" fill="#C8963E" opacity="0.15"/>
        <line x1="16" y1="11" x2="64" y2="11" stroke="#C8963E" strokeWidth="1"/>
        <rect x="16" y="24" width="48" height="2" rx="1" fill="#E8E0D6"/>
        <rect x="16" y="30" width="40" height="2" rx="1" fill="#E8E0D6"/>
        <rect x="16" y="36" width="44" height="2" rx="1" fill="#E8E0D6"/>
        <rect x="16" y="42" width="36" height="2" rx="1" fill="#E8E0D6"/>
        <rect x="16" y="52" width="20" height="8" rx="2" fill="#C8963E" opacity="0.2"/>
        <rect x="44" y="52" width="20" height="8" rx="2" fill="#1A1814" opacity="0.08"/>
        <text x="40" y="10" textAnchor="middle" fontSize="5" fill="#C8963E" fontFamily="serif" fontStyle="italic">YouDeserveNow Institute</text>
      </svg>
    ),
    badge: "Best Seller",
  },
  {
    id: "institute-mug",
    name: "The Institute Mug",
    subtitle: "11oz ceramic, dishwasher safe",
    description:
      "Start every morning with a vessel that understands you. One side reads 'Scientifically Prescribed to Treat Myself.' The other: the Institute seal. Your colleagues will ask questions.",
    price: "$17.99",
    envKey: "NEXT_PUBLIC_SHOP_MUG_URL",
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <path d="M18 20h36l-4 40H22L18 20z" fill="#FBF8F3" stroke="#E8E0D6" strokeWidth="1.5"/>
        <path d="M54 28h8a6 6 0 0 1 0 12h-8" stroke="#C8963E" strokeWidth="1.5" strokeLinecap="round"/>
        <rect x="26" y="30" width="20" height="2" rx="1" fill="#C8963E" opacity="0.5"/>
        <rect x="28" y="35" width="16" height="2" rx="1" fill="#E8E0D6"/>
        <rect x="30" y="40" width="12" height="2" rx="1" fill="#E8E0D6"/>
        <ellipse cx="36" cy="55" rx="14" ry="3" fill="#E8E0D6" opacity="0.5"/>
      </svg>
    ),
    badge: null,
  },
  {
    id: "prescription-notepad",
    name: "Prescription Notepad",
    subtitle: "50 tear-off sheets, gold foil header",
    description:
      "Write your own prescriptions. Each sheet is pre-headed with 'The Institute of Self-Reward Science' and has fields for Diagnosis, Prescribed Reward, and Dosage. Medically useless. Emotionally essential.",
    price: "$19.99",
    envKey: "NEXT_PUBLIC_SHOP_NOTEPAD_URL",
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <rect x="12" y="8" width="48" height="60" rx="3" fill="#FBF8F3" stroke="#E8E0D6" strokeWidth="1.5"/>
        <rect x="12" y="8" width="48" height="10" fill="#C8963E" opacity="0.2" rx="3"/>
        <line x1="12" y1="18" x2="60" y2="18" stroke="#C8963E" strokeWidth="0.75"/>
        <line x1="20" y1="26" x2="52" y2="26" stroke="#E8E0D6" strokeWidth="1"/>
        <line x1="20" y1="32" x2="52" y2="32" stroke="#E8E0D6" strokeWidth="1"/>
        <line x1="20" y1="38" x2="52" y2="38" stroke="#E8E0D6" strokeWidth="1"/>
        <line x1="20" y1="44" x2="44" y2="44" stroke="#E8E0D6" strokeWidth="1"/>
        <line x1="20" y1="50" x2="48" y2="50" stroke="#E8E0D6" strokeWidth="1"/>
        <line x1="12" y1="62" x2="60" y2="62" stroke="#C8963E" strokeWidth="0.5" strokeDasharray="2 2"/>
        <text x="36" y="15" textAnchor="middle" fontSize="4.5" fill="#C8963E" fontFamily="serif">Rx</text>
      </svg>
    ),
    badge: "New",
  },
  {
    id: "diagnosis-tote",
    name: "The Diagnosis Tote",
    subtitle: "Heavy-duty canvas, 15L capacity",
    description:
      "Natural canvas tote with the Institute's seal screenprinted in gold. One side reads 'I Was Scientifically Prescribed To Treat Myself.' Machine washable. Peer-reviewed. Ethically sourced.",
    price: "$22.99",
    envKey: "NEXT_PUBLIC_SHOP_TOTE_URL",
    icon: (
      <svg viewBox="0 0 80 80" className="w-full h-full" fill="none">
        <path d="M20 32h40l-6 36H26L20 32z" fill="#FBF8F3" stroke="#E8E0D6" strokeWidth="1.5"/>
        <path d="M30 32c0-6 4-12 10-12s10 6 10 12" stroke="#1A1814" strokeWidth="1.5" strokeLinecap="round" fill="none"/>
        <circle cx="40" cy="50" r="8" fill="none" stroke="#C8963E" strokeWidth="1" opacity="0.6"/>
        <text x="40" y="53" textAnchor="middle" fontSize="5" fill="#C8963E" fontFamily="serif" fontStyle="italic">YDN</text>
      </svg>
    ),
    badge: null,
  },
];

export default function ShopPage() {
  const shopItems = SHOP_ITEMS.map((item) => ({
    ...item,
    url: process.env[item.envKey] ?? null,
  }));

  const allLaunched = shopItems.every((i) => i.url);

  return (
    <div className="min-h-screen flex flex-col bg-[var(--color-bg-primary)] dark:bg-[var(--color-dark-bg)]">
      <Header />

      <main className="flex-1">
        {/* Hero */}
        <section className="max-w-3xl mx-auto px-4 sm:px-6 pt-14 pb-10 text-center">
          <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-semibold mb-3">
            Official Institute Merchandise
          </p>
          <h1
            className="text-4xl sm:text-5xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] leading-[1.1] mb-4"
            style={{ fontFamily: "var(--font-display)" }}
          >
            Wear your diagnosis<br className="hidden sm:block" /> with pride.
          </h1>
          <p className="text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] text-base sm:text-lg max-w-xl mx-auto">
            Peer-reviewed goods from the Institute of Self-Reward Science. Each item scientifically proven to spark joy, invite conversation, and justify further treating yourself.
          </p>
        </section>

        {/* Product grid */}
        <section className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {shopItems.map((item) => (
              <div
                key={item.id}
                className="group relative flex flex-col bg-[var(--color-card-bg)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] rounded-2xl overflow-hidden hover:shadow-md transition-shadow"
              >
                {item.badge && (
                  <div className="absolute top-4 right-4 z-10 text-[10px] uppercase tracking-wider font-bold px-2 py-1 rounded-full bg-[var(--color-accent)] text-white">
                    {item.badge}
                  </div>
                )}

                {/* Product illustration */}
                <div className="bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-bg)] flex items-center justify-center p-10 h-52">
                  <div className="w-28 h-28 opacity-90 group-hover:scale-105 transition-transform duration-300">
                    {item.icon}
                  </div>
                </div>

                {/* Details */}
                <div className="p-6 flex flex-col flex-1">
                  <div className="flex-1">
                    <p className="text-xs uppercase tracking-widest text-[var(--color-accent)] font-medium mb-1">
                      {item.subtitle}
                    </p>
                    <h2
                      className="text-xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-3"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.name}
                    </h2>
                    <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)] leading-relaxed">
                      {item.description}
                    </p>
                  </div>

                  <div className="flex items-center justify-between mt-6 pt-4 border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
                    <span
                      className="text-xl font-semibold text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)]"
                      style={{ fontFamily: "var(--font-display)" }}
                    >
                      {item.price}
                    </span>

                    {item.url ? (
                      <a
                        href={item.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-5 py-2.5 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] text-sm font-semibold hover:opacity-90 active:scale-95 transition-all"
                      >
                        Buy Now →
                      </a>
                    ) : (
                      <ShopNotify itemId={item.id} itemName={item.name} />
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Footer note */}
          {!allLaunched && (
            <div className="mt-10 text-center">
              <div className="inline-flex items-center gap-2 px-5 py-3 rounded-xl bg-[var(--color-bg-secondary)] dark:bg-[var(--color-dark-surface)] border border-[var(--color-card-border)] dark:border-[var(--color-dark-border)]">
                <span className="w-2 h-2 rounded-full bg-[var(--color-accent)] animate-pulse" />
                <p className="text-sm text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
                  Store launching soon — notify me subscribers go first.
                </p>
              </div>
            </div>
          )}

          {/* Back to diagnoses CTA */}
          <div className="mt-16 text-center border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] pt-12">
            <p
              className="text-2xl text-[var(--color-text-primary)] dark:text-[var(--color-dark-text)] mb-4"
              style={{ fontFamily: "var(--font-display)" }}
            >
              Haven&apos;t gotten your diagnosis yet?
            </p>
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-cta-bg)] dark:bg-[var(--color-accent)] text-[var(--color-cta-text)] dark:text-[var(--color-dark-bg)] font-semibold hover:opacity-90 active:scale-95 transition-all"
            >
              Get My Scientific Justification →
            </Link>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
