import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Blog Comptalyze - Conseils Comptabilité Micro-Entreprise",
  description: "Guides et conseils pour gérer votre micro-entreprise : URSSAF, cotisations, déclarations, factures. Tout ce qu'il faut savoir pour réussir.",
};

export default function BlogLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}

