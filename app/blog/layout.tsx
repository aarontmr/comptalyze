import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Comptalyze - Conseils Comptabilité Micro-Entreprise",
  description: "Guides et conseils pour gérer votre micro-entreprise : URSSAF, cotisations, déclarations, factures. Tout ce qu'il faut savoir pour réussir.",
  alternates: {
    canonical: 'https://comptalyze.com/blog',
  },
  openGraph: {
    title: "Blog Comptalyze - Conseils pour Micro-Entrepreneurs",
    description: "Guides URSSAF, calculs de cotisations, déclarations fiscales et astuces pour gérer votre micro-entreprise efficacement.",
    url: 'https://comptalyze.com/blog',
    siteName: 'Comptalyze',
    locale: 'fr_FR',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: "Blog Comptalyze - Conseils Micro-Entrepreneurs",
    description: "Guides URSSAF, calculs de cotisations et astuces pour votre micro-entreprise.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
