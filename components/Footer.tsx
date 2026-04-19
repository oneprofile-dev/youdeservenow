import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full border-t border-[var(--color-card-border)] dark:border-[var(--color-dark-border)] mt-16">
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-8">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-xs text-[var(--color-text-tertiary)] dark:text-[var(--color-dark-text)] max-w-md text-center sm:text-left">
            <strong>Affiliate disclosure:</strong> This site contains affiliate links. We may earn a commission if you purchase through them, at no extra cost to you.
          </p>
          <nav className="flex items-center gap-4 text-xs text-[var(--color-text-secondary)] dark:text-[var(--color-dark-text)]">
            <Link href="/gallery" className="hover:text-[var(--color-accent)] transition-colors">
              Gallery
            </Link>
            <span className="opacity-30">·</span>
            <Link href="/privacy" className="hover:text-[var(--color-accent)] transition-colors">
              Privacy
            </Link>
            <span className="opacity-30">·</span>
            <span className="text-[var(--color-text-tertiary)]">#YouDeserveNow</span>
          </nav>
        </div>
        <p className="text-xs text-[var(--color-text-tertiary)] text-center mt-4 opacity-60">
          Backed by absolutely no real science. © {new Date().getFullYear()} YouDeserveNow.com
        </p>
      </div>
    </footer>
  );
}
