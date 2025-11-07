import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { AnalyticsProvider } from './components/AnalyticsProvider';

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL('https://comptalyze.com'),
  title: {
    default: "Comptalyze - Comptabilité Simplifiée pour Micro-Entrepreneurs",
    template: "%s | Comptalyze",
  },
  description: "Logiciel de comptabilité pour micro-entrepreneurs : calcul automatique des cotisations URSSAF, factures conformes, déclarations fiscales, statistiques CA. Essai gratuit 3 jours.",
  keywords: [
    "comptalyze",
    "comptabilité micro-entreprise",
    "logiciel auto-entrepreneur",
    "déclaration urssaf",
    "cotisations sociales",
    "facture micro-entrepreneur",
    "gestion micro-entreprise",
    "calculette urssaf",
  ],
  authors: [{ name: "Comptalyze" }],
  creator: "Comptalyze",
  publisher: "Comptalyze",
  applicationName: "Comptalyze",
  referrer: 'origin-when-cross-origin',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    type: "website",
    locale: "fr_FR",
    url: "https://comptalyze.com",
    siteName: "Comptalyze",
    title: "Comptalyze - Comptabilité Simplifiée pour Micro-Entrepreneurs",
    description: "Gérez votre micro-entreprise sereinement avec Comptalyze : calcul automatique des cotisations, factures conformes, statistiques détaillées.",
    images: [
      {
        url: "/logo.png",
        width: 1200,
        height: 630,
        alt: "Comptalyze Logo",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Comptalyze - Comptabilité Simplifiée pour Micro-Entrepreneurs",
    description: "Gérez votre micro-entreprise sereinement avec Comptalyze",
    site: "@comptalyze",
    creator: "@comptalyze",
    images: ["/logo.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  icons: {
    icon: "/icon.png",
    shortcut: "/icon.png",
    apple: "/icon.png",
  },
  manifest: '/manifest.json',
  alternates: {
    canonical: 'https://comptalyze.com',
  },
  verification: {
    // Add your Google Search Console verification code here when ready
    // google: 'YOUR_VERIFICATION_CODE',
  },
  category: 'business',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        {/* Organization Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: 'Comptalyze',
              url: 'https://comptalyze.com',
              logo: 'https://comptalyze.com/logo.png',
              sameAs: [
                'https://twitter.com/comptalyze',
                'https://facebook.com/comptalyze',
                'https://linkedin.com/company/comptalyze',
              ],
              contactPoint: {
                '@type': 'ContactPoint',
                contactType: 'customer support',
                email: 'support@comptalyze.com',
                availableLanguage: ['French'],
              },
            }),
          }}
        />
        {/* WebSite Structured Data with SearchAction */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'WebSite',
              name: 'Comptalyze',
              url: 'https://comptalyze.com',
              potentialAction: {
                '@type': 'SearchAction',
                target: {
                  '@type': 'EntryPoint',
                  urlTemplate: 'https://comptalyze.com/blog?q={search_term_string}',
                },
                'query-input': 'required name=search_term_string',
              },
            }),
          }}
        />
        {/* SoftwareApplication Structured Data */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'SoftwareApplication',
              name: 'Comptalyze',
              applicationCategory: 'BusinessApplication',
              operatingSystem: 'Web',
              offers: {
                '@type': 'Offer',
                price: '9.90',
                priceCurrency: 'EUR',
                priceValidUntil: '2025-12-31',
              },
              aggregateRating: {
                '@type': 'AggregateRating',
                ratingValue: '4.8',
                ratingCount: '127',
                bestRating: '5',
                worstRating: '1',
              },
              description: 'Logiciel de comptabilité pour micro-entrepreneurs',
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
