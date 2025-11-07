import Link from "next/link";
import { Shield } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-zinc-800">
      <div className="max-w-6xl mx-auto px-4 py-8 flex flex-col gap-6">
        {/* Trust badge URSSAF */}
        <div className="flex items-center justify-center gap-2 text-sm text-zinc-400">
          <Shield className="w-4 h-4" style={{ color: "#00D084" }} />
          <span>Basé sur les données officielles de l'URSSAF</span>
        </div>
        
        {/* Hébergement et conformité */}
        <div className="text-center text-xs text-zinc-500">
          Données hébergées dans des régions UE chez Vercel; transferts encadrés par les Clauses Contractuelles Types (SCC).
        </div>
        
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          <div className="text-zinc-400 text-sm">
            © {new Date().getFullYear()} Comptalyze
          </div>
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-3 text-sm">
            <Link href="/a-propos" className="text-zinc-300 hover:text-white transition-colors">À propos</Link>
            <Link href="/legal/mentions-legales" className="text-zinc-300 hover:text-white transition-colors">Mentions légales</Link>
            <Link href="/legal/politique-de-confidentialite" className="text-zinc-300 hover:text-white transition-colors">Politique de confidentialité</Link>
            <Link href="/legal/cgv" className="text-zinc-300 hover:text-white transition-colors">CGV</Link>
          </nav>
        </div>
      </div>
    </footer>
  );
}


