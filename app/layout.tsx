import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { GoogleAnalytics } from "@/components/google-analytics";
import { GoogleAdsTag } from "@/components/google-ads";
import { FacebookPixel } from "@/components/thank-you-conversions";
import { LanguageProvider } from "@/lib/i18n";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
  themeColor: "#F37E20",
};

export const metadata: Metadata = {
  title: {
    default: "Credifin - Quick Loans for Bharat",
    template: "%s | Credifin",
  },
  description:
    "Get instant loan approval with minimal documentation. E-Rickshaw loans, EV loans, home loans, business loans & more. Interest rates starting 8.5% p.a.",
  keywords: [
    "instant loan",
    "quick loan",
    "e-rickshaw loan",
    "ev loan",
    "home loan",
    "business loan",
    "personal loan",
    "Credifin",
  ],
  authors: [{ name: "Credifin" }],
  creator: "Credifin",
  publisher: "Credifin",
  formatDetection: {
    telephone: true,
    email: true,
    address: false,
  },
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "https://campaigns.credif.in"
  ),
  openGraph: {
    type: "website",
    locale: "en_IN",
    siteName: "Credifin",
  },
  twitter: {
    card: "summary_large_image",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  verification: {
    // Add your verification IDs here
    // google: "your-google-verification-id",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable}>
      <head>
        {/* PWA manifest */}
        <link rel="manifest" href="/manifest.json" />
        <link rel="apple-touch-icon" href="/icons/icon-192x192.png" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
        {/* Preconnect to critical third-party origins */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
      </head>
      <body className="font-sans antialiased">
        {/* Analytics & Conversion Tracking */}
        <GoogleAnalytics />
        <GoogleAdsTag />
        <FacebookPixel />
        <LanguageProvider>
          {children}
        </LanguageProvider>
      </body>
    </html>
  );
}
