import Link from "next/link";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
        <div className="text-zinc-400 text-sm">
          © {new Date().getFullYear()} Comptalyze — Micro‑entreprise Noraa
        </div>
        <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
          <Link href="/a-propos" className="text-zinc-300 hover:text-white transition-colors">À propos</Link>
          <Link href="/legal/mentions-legales" className="text-zinc-300 hover:text-white transition-colors">Mentions légales</Link>
          <Link href="/legal/politique-de-confidentialite" className="text-zinc-300 hover:text-white transition-colors">Politique de confidentialité</Link>
          <Link href="/legal/cgv" className="text-zinc-300 hover:text-white transition-colors">CGV</Link>
        </nav>
      </div>
    </footer>
  );
}


