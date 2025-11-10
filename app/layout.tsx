import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import "./mobile-optimizations.css";
import AnalyticsProvider from './components/AnalyticsProvider';
import GoogleAnalytics from './components/GoogleAnalytics';
import CookieConsent from './components/CookieConsent';
import RouteProgressBar from './components/RouteProgressBar';
import ChatbotWrapper from './components/ChatbotWrapper';

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
        {/* Viewport optimisé mobile */}
        <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=5.0, user-scalable=yes, viewport-fit=cover" />
        {/* Préchargement des ressources critiques */}
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://vercel.com" />
        <link rel="dns-prefetch" href="https://comptalyze.com" />
        
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
        
        {/* Meta Pixel Code */}
        <script
          dangerouslySetInnerHTML={{
            __html: `
              !function(f,b,e,v,n,t,s)
              {if(f.fbq)return;n=f.fbq=function(){n.callMethod?
              n.callMethod.apply(n,arguments):n.queue.push(arguments)};
              if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
              n.queue=[];t=b.createElement(e);t.async=!0;
              t.src=v;s=b.getElementsByTagName(e)[0];
              s.parentNode.insertBefore(t,s)}(window, document,'script',
              'https://connect.facebook.net/en_US/fbevents.js');
              fbq('init', '2064326694403097');
              fbq('track', 'PageView');
            `,
          }}
        />
        <noscript>
          <img 
            height="1" 
            width="1" 
            style={{ display: 'none' }}
            src="https://www.facebook.com/tr?id=2064326694403097&ev=PageView&noscript=1"
            alt=""
          />
        </noscript>
        {/* End Meta Pixel Code */}
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
        style={{ transition: 'opacity 0.2s ease' }}
      >
        <RouteProgressBar />
        <GoogleAnalytics />
        <CookieConsent />
        <ChatbotWrapper />
        <AnalyticsProvider>
          {children}
        </AnalyticsProvider>
      </body>
    </html>
  );
}
