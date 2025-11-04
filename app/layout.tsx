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
  title: "Comptalyze - Micro-Entreprises",
  description:
    "Comptalyze simplifies micro-entrepreneurship: calculate your URSSAF contributions, track income, and anticipate your declarations effortlessly.",
  keywords: [
    "URSSAF",
    "micro-entreprise",
    "auto-entrepreneur",
    "simulateur cotisations",
    "revenu net",
    "URSSAF calculator",
  ],
  authors: [{ name: "Comptalyze", url: "https://comptalyze.com" }],
  metadataBase: new URL("https://comptalyze.com"),
  openGraph: {
    title: "Comptalyze – Simplify your URSSAF management",
    description:
      "A smart, minimalist tool for micro-entrepreneurs to simulate URSSAF contributions and manage income effectively.",
    url: "https://comptalyze.com",
    siteName: "Comptalyze",
    images: ["/og-image.png"],
    locale: "fr_FR",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Comptalyze – URSSAF Simulator for Micro-Entrepreneurs",
    description:
      "Manage your micro-business easily with Comptalyze: fast URSSAF calculation, income tracking, and forecasts.",
    images: ["/og-image.png"],
  },
  icons: {
    icon: "/favicon.ico",
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
