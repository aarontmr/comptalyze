import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Poppins } from "next/font/google";
import "./globals.css";
import Footer from "./components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const poppins = Poppins({
  variable: "--font-poppins",
  weight: ["300", "400", "500", "600", "700"],
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Comptalyze - Comptabilité et Gestion pour Micro-Entreprise | Simulateur URSSAF Gratuit",
  description:
    "Comptalyze : logiciel de comptabilité pour micro-entreprise et auto-entrepreneur. Calculez vos cotisations URSSAF, gérez vos factures, suivez votre CA. Essai gratuit 3 jours.",
  keywords: [
    "comptalyze",
    "comptabilité micro-entreprise",
    "comptabilité micro entreprise",
    "comptabilité auto-entrepreneur",
    "logiciel comptabilité micro-entreprise",
    "gestion micro-entreprise",
    "URSSAF",
    "simulateur URSSAF",
    "calculateur URSSAF gratuit",
    "cotisations URSSAF",
    "auto-entrepreneur",
    "micro-entreprise",
    "factures micro-entreprise",
    "revenu net micro-entreprise",
    "déclaration URSSAF",
    "simulateur cotisations sociales",
    "calcul charges sociales",
    "outil comptable auto-entrepreneur",
    "gestion factures auto-entrepreneur",
    "logiciel facturation micro-entreprise",
  ],
  authors: [{ name: "Comptalyze", url: "https://comptalyze.com" }],
  metadataBase: new URL("https://comptalyze.com"),
  openGraph: {
    title: "Comptalyze – Comptabilité simplifiée pour Micro-Entreprise",
    description:
      "Logiciel de comptabilité pour auto-entrepreneur : calculez vos cotisations URSSAF, générez vos factures, suivez votre CA en temps réel. Essai gratuit 3 jours.",
    url: "https://comptalyze.com",
    siteName: "Comptalyze",
    images: ["/og-image.png"],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comptalyze – Comptabilité Micro-Entreprise & Simulateur URSSAF",
    description:
      "Gérez votre micro-entreprise facilement avec Comptalyze : calcul URSSAF instantané, facturation, suivi de CA et prévisions.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
  },
  alternates: {
    canonical: "https://comptalyze.com",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${poppins.variable} antialiased`}
        style={{ backgroundColor: "#0e0f12" }}
      >
        {children}
        <Footer />
      </body>
    </html>
  );
}
