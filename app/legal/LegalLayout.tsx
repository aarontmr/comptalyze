import Link from "next/link";
import { ReactNode } from "react";

type LegalLayoutProps = {
  title: string;
  description?: string;
  breadcrumbLabel: string;
  children: ReactNode;
  canonicalPath: string;
};

const monthYear = () => {
  const now = new Date();
  const mois = now.toLocaleDateString("fr-FR", { month: "long" });
  const annee = now.getFullYear();
  return `${mois} ${annee}`;
};

export default function LegalLayout({
  title,
  description,
  breadcrumbLabel,
  children,
  canonicalPath,
}: LegalLayoutProps) {
  const canonicalUrl = `https://comptalyze.com${canonicalPath}`;
  return (
    <main className="min-h-[60vh]">
      <link rel="canonical" href={canonicalUrl} />
      <div className="max-w-3xl mx-auto px-4 py-10">
        <nav aria-label="Fil d'Ariane" className="text-sm text-zinc-400 mb-6">
          <ol className="flex items-center gap-2">
            <li>
              <Link href="/" className="hover:text-zinc-200 transition-colors">Accueil</Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li>
              <Link href="/legal" className="hover:text-zinc-200 transition-colors">Informations légales</Link>
            </li>
            <li className="text-zinc-600">/</li>
            <li className="text-zinc-300" aria-current="page">{breadcrumbLabel}</li>
          </ol>
        </nav>

        <header className="mb-8">
          <h1 className="text-3xl md:text-4xl font-semibold tracking-tight text-zinc-100">
            {title}
          </h1>
          <div className="mt-2 h-[2px] w-28 bg-gradient-to-r from-[#00D084] to-[#2E6CF6] rounded-full" />
          <p className="mt-4 text-zinc-400 leading-relaxed">
            {description}
          </p>
          <p className="mt-2 text-xs text-zinc-500">
            Dernière mise à jour : {monthYear()}
          </p>
        </header>

        <article className="prose prose-invert max-w-none prose-headings:text-zinc-100 prose-p:text-zinc-300 prose-a:text-zinc-200 prose-a:no-underline hover:prose-a:underline prose-strong:text-zinc-100">
          {children}
        </article>

        <hr className="my-10 border-zinc-800" />
        <p className="text-sm text-zinc-400">
          Besoin d’une autre information ? Consultez aussi nos pages
          {" "}
          <Link href="/legal/mentions-legales" className="underline hover:text-zinc-200">Mentions légales</Link>
          {" • "}
          <Link href="/legal/politique-de-confidentialite" className="underline hover:text-zinc-200">Politique de confidentialité</Link>
          {" • "}
          <Link href="/legal/cgv" className="underline hover:text-zinc-200">CGV</Link>.
        </p>
      </div>
    </main>
  );
}


