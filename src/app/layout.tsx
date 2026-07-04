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
  title: "HiddenSpot.in — Discover & Share Secluded Travel Spots & Hidden Gems",
  description:
    "Explore community-sourced viewpoints, lakes, beaches, and secret travel spots across India. View maps, share travel photos, and discover your next weekend getaway.",
  metadataBase: new URL("https://hiddenspot.in"),
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "HiddenSpot.in — Discover & Share Secluded Travel Spots & Hidden Gems",
    description:
      "Explore community-sourced viewpoints, lakes, beaches, and secret travel spots across India. View maps, share travel photos, and discover your next weekend getaway.",
    url: "https://hiddenspot.in",
    siteName: "HiddenSpot",
    locale: "en_IN",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "HiddenSpot.in — Discover & Share Secluded Travel Spots & Hidden Gems",
    description:
      "Explore community-sourced viewpoints, lakes, beaches, and secret travel spots across India. View maps, share travel photos, and discover your next weekend getaway.",
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
  return (
    <html
      lang="en"
      className={`${inter.variable} ${outfit.variable} ${caveat.variable} dark h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground transition-colors duration-300">
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
