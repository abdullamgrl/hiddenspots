import type { Metadata, Viewport } from "next";
import { Inter, Outfit, Caveat } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/navigation/navbar";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { Footer } from "@/components/navigation/footer";
import { QueryProvider } from "@/components/provider/query-provider";
import { AuthDialogProvider } from "@/components/auth/auth-dialog-provider";
import { Toaster } from "@/components/ui/sonner";
import { PWARegister } from "@/components/provider/pwa-register";
import NextTopLoader from 'nextjs-toploader';

// Fonts are self-hosted via next/font (preloaded, no CLS). The variables carry
// distinct names so globals.css can map them into the Tailwind theme without
// the theme values overriding the font loader's output.
const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const outfit = Outfit({
  subsets: ["latin"],
  variable: "--font-outfit",
});

// Script accent for taglines/eyebrows only — echoes the logo's script wordmark.
const caveat = Caveat({
  subsets: ["latin"],
  variable: "--font-caveat",
});

export const metadata: Metadata = {
  title: "HiddenSpots.in — Discover Secret Indian Travel Spots",
  description:
    "Explore vetted, community-sourced hidden travel gems across India. Find exact GPS coordinates for secret waterfalls, secluded beaches, and misty viewpoints.",
  authors: [{ name: "HiddenSpots" }],
  publisher: "HiddenSpots",
  robots: {
    index: true,
    follow: true,
  },
  metadataBase: new URL("https://hiddenspots.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HiddenSpots.in — Discover Secret Indian Travel Spots",
    description:
      "Explore vetted, community-sourced hidden travel gems across India. Find exact GPS coordinates for secret waterfalls, secluded beaches, and misty viewpoints.",
    url: "https://hiddenspots.in",
    siteName: "HiddenSpots",
    locale: "en_IN",
    type: "website",
    images: [
      {
        url: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200",
        width: 1200,
        height: 630,
        alt: "HiddenSpots.in - Discover Secret Travel Destinations",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "HiddenSpots.in — Discover Secret Indian Travel Spots",
    description:
      "Explore vetted, community-sourced hidden travel gems across India. Find exact GPS coordinates for secret waterfalls, secluded beaches, and misty viewpoints.",
    images: ["https://images.unsplash.com/photo-1506905925346-21bda4d32df4?q=80&w=1200"],
  },
  manifest: "/manifest.json",
  icons: {
    icon: "/favicon.ico",
    apple: "/icons/icon-192x192.png",
  },
};

export const viewport: Viewport = {
  themeColor: "#1F3D2E",
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const jsonLd = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': 'https://hiddenspots.in/#website',
        url: 'https://hiddenspots.in',
        name: 'HiddenSpot',
        potentialAction: {
          '@type': 'SearchAction',
          target: 'https://hiddenspots.in/search?q={search_term_string}',
          'query-input': 'required name=search_term_string',
        },
      },
      {
        '@type': 'Organization',
        '@id': 'https://hiddenspots.in/#organization',
        name: 'HiddenSpot',
        url: 'https://hiddenspots.in',
        logo: 'https://hiddenspots.in/icons/icon-512x512.png',
        sameAs: [
          'https://instagram.com/hiddenspots.in',
        ],
      },
    ],
  };

  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${caveat.variable} h-full antialiased`}
    >
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
        />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
        <NextTopLoader color="#4ade80" showSpinner={false} />
        <QueryProvider>
          <AuthDialogProvider>
            <Navbar />
            <main className="flex-1 flex flex-col pb-16 md:pb-0">{children}</main>
            <Footer />
            <MobileNav />
            <Toaster position="bottom-right" richColors closeButton />
            <PWARegister />
          </AuthDialogProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
