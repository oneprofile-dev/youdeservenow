import type { Metadata } from "next";
import { Instrument_Serif, Plus_Jakarta_Sans } from "next/font/google";
import { Analytics } from "@vercel/analytics/react";
import "./globals.css";

const instrumentSerif = Instrument_Serif({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-instrument-serif",
  display: "swap",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-jakarta",
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://youdeservenow.com";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "YouDeserveNow — Science Says You've Earned It",
    template: "%s | YouDeserveNow",
  },
  description:
    "Tell us what you accomplished today. We'll provide the peer-reviewed scientific justification for why you deserve a specific treat. Backed by absolutely no real science.",
  keywords: [
    "treat yourself",
    "self reward",
    "you deserve it",
    "pseudo science",
    "gift ideas",
    "funny",
    "viral",
  ],
  authors: [{ name: "YouDeserveNow" }],
  openGraph: {
    type: "website",
    locale: "en_US",
    url: siteUrl,
    siteName: "YouDeserveNow",
    title: "YouDeserveNow — Science Says You've Earned It",
    description:
      "Tell us what you accomplished. We'll give you the scientific justification for your treat.",
    images: [
      {
        url: "/og-image.svg",
        width: 1200,
        height: 630,
        alt: "YouDeserveNow",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "YouDeserveNow — Science Says You've Earned It",
    description: "The peer-reviewed justification for treating yourself.",
    images: ["/og-image.svg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${instrumentSerif.variable} ${plusJakartaSans.variable}`}
    >
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              try {
                if (localStorage.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
                  document.documentElement.classList.add('dark');
                }
              } catch(_) {}
            `,
          }}
        />
      </head>
      <body>
        {children}
        <Analytics />
      </body>
    </html>
  );
}
